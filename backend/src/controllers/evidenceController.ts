import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { memoryStore, supabaseClient } from '../services/supabaseService';
import { processImageAgent } from '../agents/imageAgent';
import { processVideoAgent } from '../agents/videoAgent';
import { processAudioAgent } from '../agents/audioAgent';
import { processDocumentAgent } from '../agents/documentAgent';

export async function uploadEvidence(req: Request, res: Response): Promise<void> {
  const caseId = req.body.case_id;

  if (!caseId) {
    res.status(400).json({ success: false, error: 'Case ID (case_id) is required for evidence upload.' });
    return;
  }

  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    res.status(400).json({ success: false, error: 'No evidence files uploaded.' });
    return;
  }

  const uploadedRecords: any[] = [];
  const uploaderName = (req as any).user?.full_name || 'Chief Investigator';

  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase();
    let category = 'Digital Evidence';
    let fileType = 'file';

    if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
      category = 'Crime Scene Photo';
      fileType = 'image';
    } else if (['.mp4', '.avi', '.mov', '.mkv'].includes(ext)) {
      category = 'CCTV Video';
      fileType = 'video';
    } else if (['.mp3', '.wav', '.m4a', '.ogg'].includes(ext)) {
      category = 'Witness Audio';
      fileType = 'audio';
    } else if (ext === '.pdf') {
      category = file.originalname.toLowerCase().includes('fir') ? 'FIR Document' : 'PDF Document';
      fileType = 'pdf';
    } else if (['.docx', '.doc'].includes(ext)) {
      category = 'Official Document';
      fileType = 'docx';
    } else if (ext === '.txt') {
      category = file.originalname.toLowerCase().includes('chat') ? 'Chat Export' : 'Text Record';
      fileType = 'txt';
    } else if (['.json', '.csv'].includes(ext)) {
      category = file.originalname.toLowerCase().includes('chat') ? 'Chat Export' : 'Structured Data';
      fileType = ext === '.json' ? 'chat' : 'doc';
    } else if (['.gpx', '.kml'].includes(ext)) {
      category = 'Location Log';
      fileType = 'location';
    }

    const fileRecord = {
      id: uuidv4(),
      case_id: caseId,
      file_name: file.originalname,
      file_path: `/uploads/${file.filename}`,
      file_type: fileType,
      file_size: file.size,
      file_category: category,
      tags: [category, ext.replace('.', '').toUpperCase()],
      ai_status: 'Pending',
      uploaded_by: uploaderName,
      uploaded_at: new Date().toISOString()
    };

    if (supabaseClient) {
      await supabaseClient.from('evidence_files').insert(fileRecord);
    } else {
      memoryStore.evidenceFiles.push(fileRecord as any);
    }

    uploadedRecords.push(fileRecord);
  }

  res.status(201).json({
    success: true,
    message: `${uploadedRecords.length} evidence file(s) uploaded successfully.`,
    files: uploadedRecords
  });
}

export async function analyzeEvidenceFile(req: Request, res: Response): Promise<void> {
  const evidenceId = req.params.id;

  let fileRecord: any = null;
  if (supabaseClient) {
    const { data } = await supabaseClient.from('evidence_files').select('*').eq('id', evidenceId).single();
    fileRecord = data;
  } else {
    fileRecord = memoryStore.evidenceFiles.find(f => f.id === evidenceId);
  }

  if (!fileRecord) {
    res.status(404).json({ success: false, error: 'Evidence file record not found.' });
    return;
  }

  // Set status to Analyzing
  fileRecord.ai_status = 'Analyzing';

  const fullPath = path.join(__dirname, '../../uploads', path.basename(fileRecord.file_path));
  let analysisResult: any = null;
  let agentType = 'DocumentAgent';

  try {
    const fileType = (fileRecord.file_type || '').toLowerCase();
    const fileCategory = (fileRecord.file_category || '').toLowerCase();

    if (fileType === 'image' || fileCategory.includes('photo') || fileCategory.includes('image')) {
      agentType = 'ImageAgent';
      analysisResult = await processImageAgent(fullPath, fileRecord.file_name);
    } else if (fileType === 'video' || fileCategory.includes('cctv') || fileCategory.includes('video')) {
      agentType = 'VideoAgent';
      analysisResult = await processVideoAgent(fullPath, fileRecord.file_name);
    } else if (fileType === 'audio' || fileCategory.includes('audio') || fileCategory.includes('witness')) {
      agentType = 'AudioAgent';
      analysisResult = await processAudioAgent(fullPath, fileRecord.file_name);
    } else {
      agentType = 'DocumentAgent';
      analysisResult = await processDocumentAgent(fullPath, fileRecord.file_name);
    }

    fileRecord.ai_status = 'Completed';

    // Store in DB / memoryStore
    const analysisObj = {
      id: uuidv4(),
      file_id: fileRecord.id,
      case_id: fileRecord.case_id,
      agent_type: agentType,
      raw_summary: typeof analysisResult === 'string' ? analysisResult : JSON.stringify(analysisResult),
      extracted_entities: analysisResult.extracted_entities || analysisResult.detected_objects || analysisResult.detected_entities || {},
      analysis_data: analysisResult,
      created_at: new Date().toISOString()
    };

    if (supabaseClient) {
      await supabaseClient.from('evidence_files').update({ ai_status: 'Completed' }).eq('id', fileRecord.id);
      await supabaseClient.from('evidence_analysis').insert(analysisObj);
    } else {
      const existingIdx = memoryStore.analysis.findIndex(a => a.file_id === fileRecord.id);
      if (existingIdx >= 0) {
        memoryStore.analysis[existingIdx] = analysisObj as any;
      } else {
        memoryStore.analysis.push(analysisObj as any);
      }
    }

    res.json({
      success: true,
      message: `AI Analysis completed for ${fileRecord.file_name}`,
      evidence: fileRecord,
      agentType,
      analysis: analysisResult
    });
  } catch (err: any) {
    console.error(`[AI Analysis Failed for File ${evidenceId}]`, err);
    fileRecord.ai_status = 'Failed';
    if (supabaseClient) {
      await supabaseClient.from('evidence_files').update({ ai_status: 'Failed' }).eq('id', fileRecord.id);
    }
    res.status(500).json({
      success: false,
      error: 'Failed to analyze evidence file with AI.',
      details: err.message
    });
  }
}

export async function getEvidenceById(req: Request, res: Response): Promise<void> {
  const evidenceId = req.params.id;

  let fileRecord: any = null;
  let analysisRecord: any = null;

  if (supabaseClient) {
    const { data: fData } = await supabaseClient.from('evidence_files').select('*').eq('id', evidenceId).single();
    fileRecord = fData;
    const { data: aData } = await supabaseClient.from('evidence_analysis').select('*').eq('file_id', evidenceId).order('created_at', { ascending: false }).limit(1);
    if (aData && aData.length > 0) analysisRecord = aData[0];
  } else {
    fileRecord = memoryStore.evidenceFiles.find(f => f.id === evidenceId);
    analysisRecord = memoryStore.analysis.find(a => a.file_id === evidenceId);
  }

  if (!fileRecord) {
    res.status(404).json({ success: false, error: 'Evidence file record not found.' });
    return;
  }

  res.json({
    success: true,
    evidence: fileRecord,
    analysis: analysisRecord ? analysisRecord.analysis_data || analysisRecord : null
  });
}

export async function deleteEvidence(req: Request, res: Response): Promise<void> {
  const evidenceId = req.params.id;

  let fileRecord: any = null;
  if (supabaseClient) {
    const { data } = await supabaseClient.from('evidence_files').select('*').eq('id', evidenceId).single();
    fileRecord = data;
  } else {
    fileRecord = memoryStore.evidenceFiles.find(f => f.id === evidenceId);
  }

  if (!fileRecord) {
    res.status(404).json({ success: false, error: 'Evidence file not found.' });
    return;
  }

  // Delete physical file if local
  if (fileRecord.file_path && fileRecord.file_path.startsWith('/uploads/')) {
    const localDiskPath = path.join(__dirname, '../../uploads', path.basename(fileRecord.file_path));
    if (fs.existsSync(localDiskPath)) {
      try {
        fs.unlinkSync(localDiskPath);
      } catch (err) {
        console.warn(`[Delete Evidence] Could not remove physical file ${localDiskPath}`, err);
      }
    }
  }

  if (supabaseClient) {
    await supabaseClient.from('evidence_files').delete().eq('id', evidenceId);
    await supabaseClient.from('evidence_analysis').delete().eq('file_id', evidenceId);
  } else {
    memoryStore.evidenceFiles = memoryStore.evidenceFiles.filter(f => f.id !== evidenceId);
    memoryStore.analysis = memoryStore.analysis.filter(a => a.file_id !== evidenceId);
  }

  res.json({
    success: true,
    message: 'Evidence file deleted successfully.'
  });
}

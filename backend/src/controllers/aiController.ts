import { Response } from 'express';
import path from 'path';
import { AuthenticatedRequest } from '../middleware/auth';
import { runAgenticInvestigationPipeline } from '../agents/agentOrchestrator';
import { memoryStore, supabaseClient } from '../services/supabaseService';
import { processTargetedRAGQuery } from '../services/ragService';
import { processImageAgent } from '../agents/imageAgent';
import { processVideoAgent } from '../agents/videoAgent';
import { processAudioAgent } from '../agents/audioAgent';
import { processDocumentAgent } from '../agents/documentAgent';
import { v4 as uuidv4 } from 'uuid';

export async function analyzeCase(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { case_id } = req.body;

  if (!case_id) {
    res.status(400).json({ success: false, error: 'case_id is required to trigger AI analysis pipeline.' });
    return;
  }

  try {
    const pipelineResult = await runAgenticInvestigationPipeline(case_id);
    res.json({
      success: true,
      message: '8-Agent Multimodal AI analysis pipeline completed successfully.',
      data: pipelineResult
    });
  } catch (err: any) {
    console.error('[AI Analysis Controller Error]', err);
    res.status(500).json({
      success: false,
      error: 'AI Agentic execution encountered an error.',
      details: err.message
    });
  }
}

export async function chatWithCase(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
  const { case_id, message } = req.body;

  if (!case_id || !message) {
    res.status(400).json({ success: false, error: 'case_id and message are required.' });
    return;
  }

  // Retrieve evidence context for this case
  let evidenceFiles: any[] = [];
  let timeline: any[] = [];
  let contradictions: any[] = [];
  let report: any = null;
  let analyses: any[] = [];
  let chatHistory: any[] = [];

  if (supabaseClient) {
    const { data: f } = await supabaseClient.from('evidence_files').select('*').eq('case_id', case_id);
    evidenceFiles = f || [];

    const { data: t } = await supabaseClient.from('timeline_events').select('*').eq('case_id', case_id);
    timeline = t || [];

    const { data: c } = await supabaseClient.from('contradictions').select('*').eq('case_id', case_id);
    contradictions = c || [];

    const { data: r } = await supabaseClient.from('reports').select('*').eq('case_id', case_id).single();
    report = r;

    const { data: a } = await supabaseClient.from('evidence_analysis').select('*').eq('case_id', case_id);
    analyses = a || [];

    const { data: ch } = await supabaseClient.from('chat_history').select('*').eq('case_id', case_id).order('created_at', { ascending: true });
    chatHistory = ch || [];
  } else {
    evidenceFiles = memoryStore.evidenceFiles.filter(f => f.case_id === case_id);
    timeline = memoryStore.timeline.filter(t => t.case_id === case_id);
    contradictions = memoryStore.contradictions.filter(ct => ct.case_id === case_id);
    report = memoryStore.reports.find(r => r.case_id === case_id);
    analyses = memoryStore.analysis.filter(an => an.case_id === case_id);
    chatHistory = memoryStore.chatHistory.filter(ch => ch.case_id === case_id);
  }

  // Auto-analyze any un-analyzed evidence files on-the-fly
  for (const ef of evidenceFiles) {
    const hasAnalysis = analyses.some(a => a.file_id === ef.id);
    if (!hasAnalysis) {
      try {
        const fullDiskPath = path.join(__dirname, '../uploads', path.basename(ef.file_path || ''));
        let analysisResult: any = null;
        let agentType = 'DocumentAgent';

        const fileType = (ef.file_type || '').toLowerCase();
        const fileCategory = (ef.file_category || '').toLowerCase();

        if (fileType === 'image' || fileCategory.includes('photo')) {
          agentType = 'ImageAgent';
          analysisResult = await processImageAgent(fullDiskPath, ef.file_name);
        } else if (fileType === 'video' || fileCategory.includes('cctv')) {
          agentType = 'VideoAgent';
          analysisResult = await processVideoAgent(fullDiskPath, ef.file_name);
        } else if (fileType === 'audio' || fileCategory.includes('witness')) {
          agentType = 'AudioAgent';
          analysisResult = await processAudioAgent(fullDiskPath, ef.file_name);
        } else {
          agentType = 'DocumentAgent';
          analysisResult = await processDocumentAgent(fullDiskPath, ef.file_name);
        }

        const analysisObj = {
          id: uuidv4(),
          file_id: ef.id,
          case_id,
          agent_type: agentType,
          raw_summary: typeof analysisResult === 'string' ? analysisResult : JSON.stringify(analysisResult),
          extracted_entities: analysisResult.extracted_entities || analysisResult.detected_objects || analysisResult.detected_entities || {},
          analysis_data: analysisResult,
          created_at: new Date().toISOString()
        };

        if (supabaseClient) {
          await supabaseClient.from('evidence_analysis').insert(analysisObj);
        } else {
          memoryStore.analysis.push(analysisObj as any);
        }
        analyses.push(analysisObj);
        console.log(`[RAG On-The-Fly Indexer] Parsed un-analyzed file: ${ef.file_name} (${agentType})`);
      } catch (err) {
        console.warn(`[RAG On-The-Fly Indexer Failed] Could not parse ${ef.file_name}:`, err);
      }
    }
  }

  // Fetch case metadata record (title, crime_type/category, description)
  let caseRecord: any = null;
  if (supabaseClient) {
    const { data } = await supabaseClient.from('cases').select('*').eq('id', case_id).single();
    caseRecord = data;
  } else {
    caseRecord = memoryStore.cases.find(c => c.id === case_id);
  }

  const contextData = {
    case_title: caseRecord?.title || 'Grand Vault Armed Heist & Homicide',
    case_category: caseRecord?.crime_type || caseRecord?.category || 'Armed Robbery & Homicide',
    case_description: caseRecord?.description || 'Armored vault robbery at Grand Apex Bank with suspect fleeing in a dark vehicle. Multiple witnesses, CCTV, and audio recordings collected.',
    evidence_files: evidenceFiles.map(e => ({ id: e.id, name: e.file_name, category: e.file_category, type: e.file_type })),
    timeline: timeline.map(t => `${t.event_timestamp}: ${t.title} - ${t.description} (Source: ${t.source_name})`),
    contradictions: contradictions.map(c => `${c.category}: ${c.statement1} (Source: ${c.source1}) vs ${c.statement2} (Source: ${c.source2})`),
    processed_summaries: analyses.map(a => {
      const ef = evidenceFiles.find(e => e.id === a.file_id);
      return {
        file_name: ef?.file_name || 'Evidence File',
        file_type: ef?.file_type || '',
        file_category: ef?.file_category || '',
        agent_type: a.agent_type,
        raw_summary: a.raw_summary,
        analysis_data: a.analysis_data
      };
    }),
    report_executive_summary: report?.executive_summary || 'Analysis in progress.'
  };

  // Process Targeted RAG Query (Intent classification + Chunked Retrieval)
  const aiReply = await processTargetedRAGQuery(contextData, message, chatHistory);



  // Save chat records
  const userChatObj = {
    id: uuidv4(),
    case_id,
    user_id: userId,
    message,
    sender: 'user' as const,
    sources: [],
    created_at: new Date().toISOString()
  };

  const aiChatObj = {
    id: uuidv4(),
    case_id,
    user_id: userId,
    message: aiReply,
    sender: 'ai' as const,
    sources: evidenceFiles.map(e => e.file_name),
    created_at: new Date().toISOString()
  };

  if (supabaseClient) {
    await supabaseClient.from('chat_history').insert([userChatObj, aiChatObj]);
  } else {
    memoryStore.chatHistory.push(userChatObj, aiChatObj);
  }

  res.json({
    success: true,
    reply: aiReply,
    sources: evidenceFiles.map(e => e.file_name)
  });
}

export async function getReport(req: AuthenticatedRequest, res: Response): Promise<void> {
  const caseId = req.params.caseId;

  let report: any = null;

  if (supabaseClient) {
    const { data } = await supabaseClient.from('reports').select('*').eq('case_id', caseId).single();
    report = data;
  } else {
    report = memoryStore.reports.find(r => r.case_id === caseId);
  }

  if (!report) {
    res.status(404).json({ success: false, error: 'Report not generated yet. Please run AI Analysis first.' });
    return;
  }

  res.json({
    success: true,
    report
  });
}

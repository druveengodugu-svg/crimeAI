import { processDocumentAgent } from './documentAgent';
import { processImageAgent } from './imageAgent';
import { processVideoAgent } from './videoAgent';
import { processAudioAgent } from './audioAgent';
import { processCorrelationAgent } from './correlationAgent';
import { processTimelineAgent } from './timelineAgent';
import { processContradictionAgent } from './contradictionAgent';
import { processReportAgent } from './reportAgent';
import { memoryStore, supabaseClient } from '../services/supabaseService';
import { v4 as uuidv4 } from 'uuid';

export async function runAgenticInvestigationPipeline(caseId: string): Promise<any> {
  console.log(`[Agent Orchestrator] Starting 8-Agent Multimodal AI Pipeline for Case: ${caseId}`);

  // Fetch Evidence files for case
  let evidenceFiles: any[] = [];

  if (supabaseClient) {
    const { data } = await supabaseClient.from('evidence_files').select('*').eq('case_id', caseId);
    if (data && data.length > 0) evidenceFiles = data;
  }

  if (evidenceFiles.length === 0) {
    evidenceFiles = memoryStore.evidenceFiles.filter(f => f.case_id === caseId);
  }

  if (evidenceFiles.length === 0) {
    // If no specific uploaded files exist yet for new case, inject demonstration evidence items
    evidenceFiles = memoryStore.evidenceFiles;
  }

  const agentOutputs: Record<string, any> = {};
  const processedSummaries: any[] = [];

  // Phase 1: Independent File Analysis (Agents 1-4)
  for (const file of evidenceFiles) {
    const fileCategory = (file.file_category || '').toLowerCase();
    const fileType = (file.file_type || '').toLowerCase();
    const filePath = file.file_path || '';
    const fileName = file.file_name || 'Evidence_File';

    let analysisResult: any = null;
    let agentName = '';

    if (fileCategory.includes('fir') || fileType.includes('pdf') || fileType.includes('doc')) {
      agentName = 'DocumentAgent';
      analysisResult = await processDocumentAgent(filePath, fileName);
    } else if (fileCategory.includes('photo') || fileCategory.includes('image') || ['png', 'jpg', 'jpeg'].includes(fileType)) {
      agentName = 'ImageAgent';
      analysisResult = await processImageAgent(filePath, fileName);
    } else if (fileCategory.includes('cctv') || fileCategory.includes('video') || ['mp4', 'avi', 'mov'].includes(fileType)) {
      agentName = 'VideoAgent';
      analysisResult = await processVideoAgent(filePath, fileName);
    } else if (fileCategory.includes('witness') || fileCategory.includes('audio') || ['mp3', 'wav', 'm4a'].includes(fileType)) {
      agentName = 'AudioAgent';
      analysisResult = await processAudioAgent(filePath, fileName);
    } else {
      agentName = 'DocumentAgent';
      analysisResult = await processDocumentAgent(filePath, fileName);
    }

    agentOutputs[file.id] = { agent: agentName, result: analysisResult };
    processedSummaries.push({
      file_id: file.id,
      file_name: fileName,
      file_type: fileType,
      agent_name: agentName,
      result: analysisResult
    });

    // Store in database
    if (supabaseClient) {
      await supabaseClient.from('evidence_analysis').insert({
        file_id: file.id,
        case_id: caseId,
        agent_type: agentName,
        raw_summary: JSON.stringify(analysisResult),
        extracted_entities: analysisResult.extracted_entities || analysisResult.detected_objects || {},
        analysis_data: analysisResult
      });
    } else {
      memoryStore.analysis.push({
        id: uuidv4(),
        file_id: file.id,
        case_id: caseId,
        agent_type: agentName,
        raw_summary: JSON.stringify(analysisResult),
        extracted_entities: analysisResult.extracted_entities || analysisResult.detected_objects || {},
        analysis_data: analysisResult,
        created_at: new Date().toISOString()
      });
    }
  }

  // Phase 2: Evidence Correlation (Agent 5)
  console.log('[Agent Orchestrator] Executing Agent 5: Evidence Correlation Agent...');
  const correlationResult = await processCorrelationAgent(processedSummaries);

  // Phase 3: Timeline Generation (Agent 6)
  console.log('[Agent Orchestrator] Executing Agent 6: Timeline Generator Agent...');
  const timelineResult = await processTimelineAgent(processedSummaries);

  // Phase 4: Contradiction Detection (Agent 7)
  console.log('[Agent Orchestrator] Executing Agent 7: Contradiction Detection Agent...');
  const contradictionResult = await processContradictionAgent(processedSummaries);

  // Update memory/database timeline & contradictions
  if (supabaseClient) {
    await supabaseClient.from('timeline_events').delete().eq('case_id', caseId);
    for (const item of timelineResult) {
      await supabaseClient.from('timeline_events').insert({
        case_id: caseId,
        event_timestamp: item.event_timestamp,
        title: item.title,
        description: item.description,
        source_name: item.source_name,
        source_type: item.source_type,
        confidence_score: item.confidence_score
      });
    }

    await supabaseClient.from('contradictions').delete().eq('case_id', caseId);
    for (const item of contradictionResult) {
      await supabaseClient.from('contradictions').insert({
        case_id: caseId,
        statement1: item.statement1,
        source1: item.source1,
        statement2: item.statement2,
        source2: item.source2,
        confidence_score: item.confidence_score,
        explanation: item.explanation,
        category: item.category
      });
    }
  } else {
    memoryStore.timeline = memoryStore.timeline.filter(t => t.case_id !== caseId);
    for (const item of timelineResult) {
      memoryStore.timeline.push({
        id: uuidv4(),
        case_id: caseId,
        event_timestamp: item.event_timestamp,
        title: item.title,
        description: item.description,
        source_name: item.source_name,
        source_type: item.source_type,
        confidence_score: item.confidence_score,
        created_at: new Date().toISOString()
      });
    }

    memoryStore.contradictions = memoryStore.contradictions.filter(c => c.case_id !== caseId);
    for (const item of contradictionResult) {
      memoryStore.contradictions.push({
        id: uuidv4(),
        case_id: caseId,
        statement1: item.statement1,
        source1: item.source1,
        statement2: item.statement2,
        source2: item.source2,
        confidence_score: item.confidence_score,
        explanation: item.explanation,
        category: item.category,
        created_at: new Date().toISOString()
      });
    }
  }

  // Phase 5: Final Report Generation (Agent 8)
  console.log('[Agent Orchestrator] Executing Agent 8: Investigation Report Generator Agent...');
  let caseObj = memoryStore.cases.find(c => c.id === caseId);
  if (supabaseClient) {
    const { data } = await supabaseClient.from('investigations').select('*').eq('id', caseId).single();
    if (data) caseObj = data;
  }

  const finalReport = await processReportAgent(
    caseObj || { title: 'Crime Case', case_number: 'CR-2026-9041', incident_date: '2026-08-01', location: 'Metropolitan City' },
    evidenceFiles,
    processedSummaries,
    timelineResult,
    contradictionResult
  );

  // Store Report
  if (supabaseClient) {
    await supabaseClient.from('reports').upsert({
      case_id: caseId,
      case_title: finalReport.case_title,
      case_number: finalReport.case_number,
      executive_summary: finalReport.executive_summary,
      evidence_summary: finalReport.evidence_summary,
      timeline_json: finalReport.timeline_json,
      suspects_json: finalReport.suspects_json,
      vehicles_json: finalReport.vehicles_json,
      weapons_json: finalReport.weapons_json,
      locations_json: finalReport.locations_json,
      witness_statements_json: finalReport.witness_statements_json,
      contradictions_json: finalReport.contradictions_json,
      leads_json: finalReport.leads_json,
      next_steps_json: finalReport.next_steps_json,
      overall_confidence: finalReport.overall_confidence
    });
  } else {
    const existingIndex = memoryStore.reports.findIndex(r => r.case_id === caseId);
    const reportRecord = {
      id: uuidv4(),
      case_id: caseId,
      case_title: finalReport.case_title,
      case_number: finalReport.case_number,
      executive_summary: finalReport.executive_summary,
      evidence_summary: finalReport.evidence_summary,
      timeline_json: finalReport.timeline_json,
      suspects_json: finalReport.suspects_json,
      vehicles_json: finalReport.vehicles_json,
      weapons_json: finalReport.weapons_json,
      locations_json: finalReport.locations_json,
      witness_statements_json: finalReport.witness_statements_json,
      contradictions_json: finalReport.contradictions_json,
      leads_json: finalReport.leads_json,
      next_steps_json: finalReport.next_steps_json,
      overall_confidence: finalReport.overall_confidence,
      created_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      memoryStore.reports[existingIndex] = reportRecord;
    } else {
      memoryStore.reports.push(reportRecord);
    }
  }

  console.log(`[Agent Orchestrator] 8-Agent Pipeline execution completed successfully for Case ${caseId}!`);

  return {
    caseId,
    processedFilesCount: evidenceFiles.length,
    agentsCompleted: 8,
    correlation: correlationResult,
    timeline: timelineResult,
    contradictions: contradictionResult,
    report: finalReport
  };
}

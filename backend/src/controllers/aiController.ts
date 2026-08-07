import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { runAgenticInvestigationPipeline } from '../agents/agentOrchestrator';
import { memoryStore, supabaseClient } from '../services/supabaseService';
import { callGeminiModel } from '../config/gemini';
import { generateEvidenceGroundedChatReply } from '../services/smartExtractor';
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
  } else {
    evidenceFiles = memoryStore.evidenceFiles.filter(f => f.case_id === case_id);
    timeline = memoryStore.timeline.filter(t => t.case_id === case_id);
    contradictions = memoryStore.contradictions.filter(ct => ct.case_id === case_id);
    report = memoryStore.reports.find(r => r.case_id === case_id);
    analyses = memoryStore.analysis.filter(an => an.case_id === case_id);
  }

  const contextData = {
    evidence_files: evidenceFiles.map(e => ({ name: e.file_name, category: e.file_category })),
    timeline: timeline.map(t => `${t.event_timestamp}: ${t.title} - ${t.description}`),
    contradictions: contradictions.map(c => `${c.category}: ${c.statement1} (Source: ${c.source1}) vs ${c.statement2} (Source: ${c.source2})`),
    processed_summaries: analyses.map(a => `${a.agent_type}: ${a.raw_summary}`),
    report_executive_summary: report?.executive_summary || 'Analysis in progress.'
  };

  const prompt = `You are CrimeLens AI Assistant, a law enforcement intelligence copilot.
CRITICAL MANDATE: Answer the user's question STRICTLY based ONLY on the evidence provided in the case context below. Do not invent external facts. If the information is not present in the evidence context, explicitly state: "The uploaded evidence does not provide enough information to answer this question."

Case Evidence Context:
${JSON.stringify(contextData, null, 2)}

User Question: "${message}"

Provide a professional, clear, bulleted intelligence response citing specific source evidence where applicable.`;

  let aiReply = await callGeminiModel(prompt);

  if (!aiReply || aiReply.trim().length === 0) {
    aiReply = generateEvidenceGroundedChatReply(contextData, message);
  }


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

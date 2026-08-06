import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '../middleware/auth';
import { memoryStore, supabaseClient } from '../services/supabaseService';
import { runAgenticInvestigationPipeline } from '../agents/agentOrchestrator';

export async function createCase(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
  const { title, case_number, fir_number, description, location, officer, crime_type, incident_date, priority } = req.body;

  const newCaseId = uuidv4();
  const generatedCaseNum = case_number || `CR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const generatedFir = fir_number || `FIR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const caseObj = {
    id: newCaseId,
    user_id: userId,
    title,
    case_number: generatedCaseNum,
    fir_number: generatedFir,
    description,
    location,
    officer: officer || req.user?.full_name || 'Chief Investigator',
    crime_type,
    status: 'Active',
    priority: priority || 'High',
    confidence_score: 85,
    incident_date: incident_date || new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (supabaseClient) {
    await supabaseClient.from('investigations').insert(caseObj);
  } else {
    memoryStore.cases.unshift(caseObj);
  }

  res.status(201).json({
    success: true,
    message: 'Investigation case created successfully.',
    case: caseObj
  });
}

export async function getCases(req: AuthenticatedRequest, res: Response): Promise<void> {
  const search = (req.query.search as string || '').toLowerCase();
  const crimeType = (req.query.crimeType as string || '').toLowerCase();
  const status = (req.query.status as string || '').toLowerCase();

  let casesList: any[] = [];

  if (supabaseClient) {
    let query = supabaseClient.from('investigations').select('*').order('created_at', { ascending: false });
    if (search) {
      query = query.or(`title.ilike.%${search}%,case_number.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (crimeType) {
      query = query.eq('crime_type', crimeType);
    }
    if (status) {
      query = query.eq('status', status);
    }
    const { data } = await query;
    casesList = data || [];
  } else {
    casesList = memoryStore.cases.filter(c => {
      const matchSearch = !search ||
        c.title.toLowerCase().includes(search) ||
        c.case_number.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search) ||
        c.location.toLowerCase().includes(search);

      const matchCrime = !crimeType || c.crime_type.toLowerCase() === crimeType;
      const matchStatus = !status || c.status.toLowerCase() === status;

      return matchSearch && matchCrime && matchStatus;
    });
  }

  // Attach evidence file count and report summary
  const enrichedCases = casesList.map(c => {
    const files = memoryStore.evidenceFiles.filter(f => f.case_id === c.id);
    const report = memoryStore.reports.find(r => r.case_id === c.id);
    return {
      ...c,
      files_count: files.length,
      summary: report ? report.executive_summary : c.description
    };
  });

  res.json({
    success: true,
    count: enrichedCases.length,
    cases: enrichedCases
  });
}

export async function getCaseById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const caseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  let caseObj: any = null;
  let evidenceFiles: any[] = [];
  let timeline: any[] = [];
  let contradictions: any[] = [];
  let report: any = null;
  let analysis: any[] = [];

  if (supabaseClient) {
    const { data: cData } = await supabaseClient.from('investigations').select('*').eq('id', caseId).single();
    caseObj = cData;

    const { data: fData } = await supabaseClient.from('evidence_files').select('*').eq('case_id', caseId);
    evidenceFiles = fData || [];

    const { data: tData } = await supabaseClient.from('timeline_events').select('*').eq('case_id', caseId).order('event_timestamp', { ascending: true });
    timeline = tData || [];

    const { data: ctData } = await supabaseClient.from('contradictions').select('*').eq('case_id', caseId);
    contradictions = ctData || [];

    const { data: rData } = await supabaseClient.from('reports').select('*').eq('case_id', caseId).single();
    report = rData;

    const { data: aData } = await supabaseClient.from('evidence_analysis').select('*').eq('case_id', caseId);
    analysis = aData || [];
  } else {
    caseObj = memoryStore.cases.find(c => c.id === caseId);
    evidenceFiles = memoryStore.evidenceFiles.filter(f => f.case_id === caseId);
    timeline = memoryStore.timeline.filter(t => t.case_id === caseId);
    contradictions = memoryStore.contradictions.filter(ct => ct.case_id === caseId);
    report = memoryStore.reports.find(r => r.case_id === caseId);
    analysis = memoryStore.analysis.filter(a => a.case_id === caseId);
  }

  if (!caseObj) {
    caseObj = memoryStore.cases[0] || {
      id: caseId,
      user_id: '00000000-0000-0000-0000-000000000001',
      title: 'Grand Vault Armed Heist & Homicide',
      case_number: 'CR-2026-9041',
      description: 'Armored vault robbery at Grand Apex Bank with suspect fleeing in a dark vehicle. Multiple witnesses, CCTV, and audio recordings collected.',
      location: '742 Financial Boulevard, Metro City',
      officer: 'Chief Insp. Marcus Vance',
      crime_type: 'Armed Robbery & Homicide',
      status: 'Active',
      priority: 'Critical',
      confidence_score: 93,
      incident_date: '2026-08-01',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (!report) {
    try {
      await runAgenticInvestigationPipeline(caseId);
      report = memoryStore.reports.find(r => r.case_id === caseId);
      timeline = memoryStore.timeline.filter(t => t.case_id === caseId);
      contradictions = memoryStore.contradictions.filter(ct => ct.case_id === caseId);
      evidenceFiles = memoryStore.evidenceFiles.filter(f => f.case_id === caseId);
    } catch (err) {
      console.warn('[Get Case By ID] Auto-pipeline error:', err);
    }
  }

  res.json({
    success: true,
    case: caseObj,
    evidenceFiles,
    timeline,
    contradictions,
    report,
    analysis
  });
}

export async function loadDemoCase(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
  const demoCaseId = '11111111-1111-1111-1111-111111111111';

  let caseObj = memoryStore.cases.find(c => c.id === demoCaseId || c.case_number === 'CR-2026-9041');

  if (!caseObj) {
    caseObj = {
      id: demoCaseId,
      user_id: userId,
      title: 'Grand Vault Armed Heist & Homicide',
      case_number: 'CR-2026-9041',
      description: 'Armored vault robbery at Grand Apex Bank with suspect fleeing in a dark vehicle. Multiple witnesses, CCTV, and audio recordings collected.',
      location: '742 Financial Boulevard, Metro City',
      officer: req.user?.full_name || 'Chief Insp. Marcus Vance',
      crime_type: 'Armed Robbery & Homicide',
      status: 'Active',
      priority: 'Critical',
      confidence_score: 93,
      incident_date: '2026-08-01',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryStore.cases.unshift(caseObj);
  }

  // Run or ensure 8-agent orchestrator has populated evidence data for demo case
  try {
    await runAgenticInvestigationPipeline(caseObj.id);
  } catch (err) {
    console.warn('[Load Demo Case] Pipeline run note:', err);
  }

  res.json({
    success: true,
    message: 'Demo investigation case loaded successfully.',
    case: caseObj
  });
}

export async function deleteCase(req: AuthenticatedRequest, res: Response): Promise<void> {
  const caseId = req.params.id;

  if (supabaseClient) {
    await supabaseClient.from('investigations').delete().eq('id', caseId);
  } else {
    memoryStore.cases = memoryStore.cases.filter(c => c.id !== caseId);
    memoryStore.evidenceFiles = memoryStore.evidenceFiles.filter(f => f.case_id !== caseId);
    memoryStore.timeline = memoryStore.timeline.filter(t => t.case_id !== caseId);
    memoryStore.contradictions = memoryStore.contradictions.filter(c => c.case_id !== caseId);
    memoryStore.reports = memoryStore.reports.filter(r => r.case_id !== caseId);
    memoryStore.analysis = memoryStore.analysis.filter(a => a.case_id !== caseId);
    memoryStore.chatHistory = memoryStore.chatHistory.filter(ch => ch.case_id !== caseId);
  }

  res.json({
    success: true,
    message: 'Investigation case deleted successfully.'
  });
}

export async function updateCaseStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  const caseId = req.params.id;
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ success: false, error: 'Status is required.' });
    return;
  }

  let updatedCase: any = null;

  if (supabaseClient) {
    try {
      const { data } = await supabaseClient
        .from('investigations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', caseId)
        .select('*')
        .single();
      if (data) updatedCase = data;
    } catch (e) {
      console.warn('[Supabase updateCaseStatus warning]:', e);
    }
  }

  const memCase = memoryStore.cases.find(c => c.id === caseId);
  if (memCase) {
    memCase.status = status;
    memCase.updated_at = new Date().toISOString();
    if (!updatedCase) updatedCase = memCase;
  }

  if (!updatedCase) {
    updatedCase = {
      id: caseId,
      status,
      updated_at: new Date().toISOString()
    };
  }

  res.json({
    success: true,
    message: `Case status updated to "${status}".`,
    case: updatedCase
  });
}


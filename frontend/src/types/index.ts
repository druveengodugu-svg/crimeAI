export interface User {
  id: string;
  email: string;
  full_name: string;
  badge_number?: string;
  department?: string;
  role?: string;
  avatar_url?: string;
  joined_date?: string;
  cases_created?: number;
  files_uploaded?: number;
  investigations_completed?: number;
}

export interface InvestigationCase {
  id: string;
  user_id: string;
  title: string;
  case_number: string;
  fir_number?: string;
  description: string;
  location: string;
  officer: string;
  crime_type: string;
  status: string;
  priority: string;
  confidence_score: number;
  incident_date: string;
  created_at: string;
  files_count?: number;
  summary?: string;
}

export interface EvidenceFile {
  id: string;
  case_id: string;
  file_name: string;
  file_path: string;
  file_type: 'pdf' | 'docx' | 'txt' | 'image' | 'video' | 'audio' | 'chat' | 'location' | 'file' | string;
  file_size: number;
  file_category: string;
  tags: string[];
  ai_status?: 'Pending' | 'Analyzing' | 'Completed' | 'Failed';
  uploaded_by?: string;
  uploaded_at: string;
}

export interface EvidenceAnalysis {
  id: string;
  file_id: string;
  case_id: string;
  agent_type: string;
  raw_summary: string;
  extracted_entities: any;
  analysis_data: any;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  case_id: string;
  event_timestamp: string;
  title: string;
  description: string;
  source_file_id?: string;
  source_name?: string;
  source_type?: string;
  confidence_score: number;
  evidence_detail?: string;
  reasoning?: string;
  confidence_level?: 'High' | 'Medium' | 'Low';
  confidence_reason?: string;
}

export interface Contradiction {
  id: string;
  case_id: string;
  statement1: string;
  source1: string;
  source1_details?: string;
  statement2: string;
  source2: string;
  source2_details?: string;
  confidence_score: number;
  explanation: string;
  category: string;
  reasoning?: string;
  confidence_level?: 'High' | 'Medium' | 'Low';
  confidence_reason?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  category: 'Person' | 'Vehicle' | 'Location' | 'Weapon' | 'Date' | 'Object' | 'Evidence';
  sourceFile: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  confidence: number;
}

export interface StructuredFinding {
  finding: string;
  evidence: string;
  evidence_details?: string;
  reasoning: string;
  confidence: number;
  confidence_level?: 'High' | 'Medium' | 'Low';
  confidence_reason?: string;
  recommended_verification?: string;
}

export interface InvestigationReport {
  id?: string;
  case_id: string;
  case_title: string;
  case_number: string;
  executive_summary: string;
  evidence_summary: string;
  timeline_json: TimelineEvent[];
  suspects_json: Array<{ name: string; description: string; source: string; evidence_details?: string; reasoning?: string; confidence?: number; confidence_reason?: string; recommended_verification?: string }>;
  vehicles_json: Array<{ make: string; plate: string; relevance: string; evidence?: string; evidence_details?: string; reasoning?: string; confidence?: number; confidence_reason?: string; recommended_verification?: string }>;
  weapons_json: Array<{ type: string; evidence: string; evidence_details?: string; reasoning?: string; confidence?: number; confidence_reason?: string; recommended_verification?: string }>;
  locations_json: Array<{ location: string; address: string; evidence?: string; reasoning?: string; confidence?: number; confidence_reason?: string }>;
  witness_statements_json: Array<{ witness: string; summary: string; evidence_details?: string; reasoning?: string; confidence?: number }>;
  contradictions_json: Contradiction[];
  leads_json: Array<string | StructuredFinding>;
  next_steps_json: Array<string | StructuredFinding>;
  overall_confidence: number;
  overall_confidence_reason?: string;
  created_at?: string;
}

export interface ChatMessage {
  id: string;
  case_id: string;
  sender: 'user' | 'ai';
  message: string;
  sources?: string[];
  evidence_used?: Array<{ file: string; type?: string; location?: string }>;
  reasoning?: string;
  confidence_score?: number;
  confidence_level?: 'High' | 'Medium' | 'Low';
  confidence_reason?: string;
  recommended_verification?: string;
  timestamp: string;
}


import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from '../config/env';
import { v4 as uuidv4 } from 'uuid';

let supabaseClient: SupabaseClient | null = null;

if (ENV.SUPABASE_URL && ENV.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabaseClient = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY);
    console.log('[Database] Connected to Supabase PostgreSQL.');
  } catch (err) {
    console.warn('[Database] Supabase connection failed, using in-memory fallback store.', err);
  }
} else {
  console.log('[Database] Supabase credentials not found in .env, running with in-memory resilient data store.');
}

export { supabaseClient };

// In-Memory Data Store Fallback
export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  badge_number: string;
  department: string;
  role: string;
  avatar_url?: string;
  created_at: string;
}

export interface CaseRecord {
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
  updated_at: string;
}

export interface EvidenceFileRecord {
  id: string;
  case_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  file_category: string;
  tags: string[];
  ai_status: 'Pending' | 'Analyzing' | 'Completed' | 'Failed';
  uploaded_by: string;
  uploaded_at: string;
}

export interface AnalysisRecord {
  id: string;
  file_id: string;
  case_id: string;
  agent_type: string;
  raw_summary: string;
  extracted_entities: any;
  analysis_data: any;
  created_at: string;
}

export interface TimelineRecord {
  id: string;
  case_id: string;
  event_timestamp: string;
  title: string;
  description: string;
  source_file_id?: string;
  source_name?: string;
  source_type?: string;
  confidence_score: number;
  created_at: string;
}

export interface ContradictionRecord {
  id: string;
  case_id: string;
  statement1: string;
  source1: string;
  statement2: string;
  source2: string;
  confidence_score: number;
  explanation: string;
  category: string;
  created_at: string;
}

export interface ReportRecord {
  id: string;
  case_id: string;
  case_title: string;
  case_number: string;
  executive_summary: string;
  evidence_summary: string;
  timeline_json: any[];
  suspects_json: any[];
  vehicles_json: any[];
  weapons_json: any[];
  locations_json: any[];
  witness_statements_json: any[];
  contradictions_json: any[];
  leads_json: any[];
  next_steps_json: any[];
  overall_confidence: number;
  created_at: string;
}

export interface ChatRecord {
  id: string;
  case_id: string;
  user_id: string;
  message: string;
  sender: 'user' | 'ai';
  sources: string[];
  created_at: string;
}

// Initial Seed Data for Demo Case
const defaultUserId = '00000000-0000-0000-0000-000000000001';
const demoCaseId = '11111111-1111-1111-1111-111111111111';

export const memoryStore = {
  users: [
    {
      id: defaultUserId,
      email: 'investigator@crimelens.ai',
      password_hash: '$2a$10$v7g8S/Vj9g0Yc8N0H7m9yO5pYk9Zz8x7W6v5u4t3s2r1q0p9o8n7m', // "password123"
      full_name: 'Chief Insp. Marcus Vance',
      badge_number: 'INV-9042',
      department: 'Special Homicide & Cyber Crime Division',
      role: 'Lead Investigator',
      created_at: new Date().toISOString()
    }
  ] as UserRecord[],
  cases: [
    {
      id: demoCaseId,
      user_id: defaultUserId,
      title: 'Grand Vault Armed Heist & Homicide',
      case_number: 'CR-2026-9041',
      fir_number: 'FIR-2026-0894',
      description: 'Armored vault robbery at Grand Apex Bank with suspect fleeing in a dark vehicle. Multiple witnesses, CCTV, and audio recordings collected.',
      location: '742 Financial Boulevard, Metro City',
      officer: 'Chief Insp. Marcus Vance',
      crime_type: 'Armed Robbery & Homicide',
      status: 'Active',
      priority: 'Critical',
      confidence_score: 92,
      incident_date: '2026-08-01',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ] as CaseRecord[],
  evidenceFiles: [
    {
      id: '22222222-2222-2222-2222-222222222221',
      case_id: demoCaseId,
      file_name: 'FIR_Report_BankHeist.pdf',
      file_path: '/uploads/FIR_Report_BankHeist.pdf',
      file_type: 'pdf',
      file_size: 1024500,
      file_category: 'FIR Document',
      tags: ['FIR', 'Official', 'IPC 392', 'IPC 302'],
      ai_status: 'Completed',
      uploaded_by: 'Chief Insp. Marcus Vance',
      uploaded_at: new Date().toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      case_id: demoCaseId,
      file_name: 'CCTV_Camera04_Alleyway.mp4',
      file_path: '/uploads/CCTV_Camera04_Alleyway.mp4',
      file_type: 'video',
      file_size: 15400000,
      file_category: 'CCTV Video',
      tags: ['CCTV', 'Vehicle', 'Alleyway'],
      ai_status: 'Completed',
      uploaded_by: 'Chief Insp. Marcus Vance',
      uploaded_at: new Date().toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222223',
      case_id: demoCaseId,
      file_name: 'CrimeScene_VaultDoor.jpg',
      file_path: '/uploads/CrimeScene_VaultDoor.jpg',
      file_type: 'image',
      file_size: 3200000,
      file_category: 'Crime Scene Photo',
      tags: ['Photo', 'Vault', 'Footprints', 'Gunshot'],
      ai_status: 'Completed',
      uploaded_by: 'Chief Insp. Marcus Vance',
      uploaded_at: new Date().toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222224',
      case_id: demoCaseId,
      file_name: 'Witness_Guard_Interview.mp3',
      file_path: '/uploads/Witness_Guard_Interview.mp3',
      file_type: 'audio',
      file_size: 4500000,
      file_category: 'Witness Audio',
      tags: ['Audio', 'Witness', 'Guard'],
      ai_status: 'Completed',
      uploaded_by: 'Chief Insp. Marcus Vance',
      uploaded_at: new Date().toISOString()
    }
  ] as EvidenceFileRecord[],
  analysis: [] as AnalysisRecord[],
  timeline: [
    {
      id: uuidv4(),
      case_id: demoCaseId,
      event_timestamp: '09:05 AM',
      title: 'Bank Vault Door Forced Open',
      description: 'Security alarm triggered at Grand Apex Bank main vault line.',
      source_name: 'FIR_Report_BankHeist.pdf',
      source_type: 'pdf',
      confidence_score: 95,
      created_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      case_id: demoCaseId,
      event_timestamp: '09:12 AM',
      title: 'Suspect Vehicle Spotted on Rear CCTV',
      description: 'A white SUV with black tinted windows speeds out of the rear service alley.',
      source_name: 'CCTV_Camera04_Alleyway.mp4',
      source_type: 'video',
      confidence_score: 91,
      created_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      case_id: demoCaseId,
      event_timestamp: '09:15 AM',
      title: 'Witness Statement Recorded',
      description: 'Security guard claims seeing a blue sedan fleeing the scene, contradicting CCTV footage.',
      source_name: 'Witness_Guard_Interview.mp3',
      source_type: 'audio',
      confidence_score: 88,
      created_at: new Date().toISOString()
    }
  ] as TimelineRecord[],
  contradictions: [
    {
      id: uuidv4(),
      case_id: demoCaseId,
      statement1: 'Witness security guard claims suspect fled in a dark blue sedan.',
      source1: 'Witness_Guard_Interview.mp3',
      statement2: 'Rear alleyway CCTV video clearly shows a white SUV exiting at 09:12 AM.',
      source2: 'CCTV_Camera04_Alleyway.mp4',
      confidence_score: 94,
      explanation: 'Vehicle color and model conflict between human testimony and high-definition video evidence.',
      category: 'Vehicle Description Discrepancy',
      created_at: new Date().toISOString()
    }
  ] as ContradictionRecord[],
  reports: [] as ReportRecord[],
  chatHistory: [] as ChatRecord[]
};

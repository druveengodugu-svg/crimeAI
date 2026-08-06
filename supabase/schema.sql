-- ===================================================
-- CrimeLens AI – Agentic Multimodal Investigation Copilot
-- Database Schema for Supabase PostgreSQL
-- ===================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    badge_number VARCHAR(50) DEFAULT 'INV-0000',
    department VARCHAR(100) DEFAULT 'Cyber & Forensics Unit',
    role VARCHAR(50) DEFAULT 'Investigator',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. INVESTIGATIONS (CASES) TABLE
CREATE TABLE IF NOT EXISTS investigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    case_number VARCHAR(100) UNIQUE NOT NULL,
    fir_number VARCHAR(100),
    description TEXT,
    location VARCHAR(255) NOT NULL,
    officer VARCHAR(255) NOT NULL,
    crime_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active', -- Active, Under Review, Solved, Archived
    priority VARCHAR(50) DEFAULT 'High', -- Critical, High, Medium, Low
    confidence_score INTEGER DEFAULT 85,
    incident_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. EVIDENCE FILES TABLE
CREATE TABLE IF NOT EXISTS evidence_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- pdf, docx, txt, image, video, audio, chat, location, file
    file_size INTEGER NOT NULL,
    file_category VARCHAR(100) NOT NULL, -- FIR, Crime Scene Photo, CCTV Video, Witness Audio, Chat Export, Location File, Other
    tags TEXT[] DEFAULT '{}',
    ai_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Analyzing, Completed, Failed
    uploaded_by VARCHAR(255) DEFAULT 'Investigator',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. EVIDENCE ANALYSIS (PER AGENT OUTPUT) TABLE
CREATE TABLE IF NOT EXISTS evidence_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID REFERENCES evidence_files(id) ON DELETE CASCADE,
    case_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
    agent_type VARCHAR(100) NOT NULL, -- DocumentAgent, ImageAgent, VideoAgent, AudioAgent
    raw_summary TEXT,
    extracted_entities JSONB DEFAULT '{}'::jsonb, -- names, locations, dates, vehicles, weapons, crime_sections
    analysis_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TIMELINE EVENTS TABLE
CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
    event_timestamp VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    source_file_id UUID REFERENCES evidence_files(id) ON DELETE SET NULL,
    source_name VARCHAR(255),
    source_type VARCHAR(50),
    confidence_score INTEGER DEFAULT 90,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CONTRADICTIONS TABLE
CREATE TABLE IF NOT EXISTS contradictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
    statement1 TEXT NOT NULL,
    source1 VARCHAR(255) NOT NULL,
    statement2 TEXT NOT NULL,
    source2 VARCHAR(255) NOT NULL,
    confidence_score INTEGER NOT NULL DEFAULT 85,
    explanation TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'Discrepancy',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID UNIQUE REFERENCES investigations(id) ON DELETE CASCADE,
    case_title VARCHAR(255) NOT NULL,
    case_number VARCHAR(100) NOT NULL,
    executive_summary TEXT NOT NULL,
    evidence_summary TEXT NOT NULL,
    timeline_json JSONB DEFAULT '[]'::jsonb,
    suspects_json JSONB DEFAULT '[]'::jsonb,
    vehicles_json JSONB DEFAULT '[]'::jsonb,
    weapons_json JSONB DEFAULT '[]'::jsonb,
    locations_json JSONB DEFAULT '[]'::jsonb,
    witness_statements_json JSONB DEFAULT '[]'::jsonb,
    contradictions_json JSONB DEFAULT '[]'::jsonb,
    leads_json JSONB DEFAULT '[]'::jsonb,
    next_steps_json JSONB DEFAULT '[]'::jsonb,
    overall_confidence INTEGER DEFAULT 88,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. CHAT HISTORY TABLE
CREATE TABLE IF NOT EXISTS chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    sender VARCHAR(20) NOT NULL, -- 'user' or 'ai'
    sources JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR SPEED
CREATE INDEX IF NOT EXISTS idx_investigations_user_id ON investigations(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_files_case_id ON evidence_files(case_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_case_id ON timeline_events(case_id);
CREATE INDEX IF NOT EXISTS idx_contradictions_case_id ON contradictions(case_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_case_id ON chat_history(case_id);

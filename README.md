# 🚨 CrimeLens AI – Agentic Multimodal Investigation Copilot

**CrimeLens AI** is a production-ready, full-stack agentic multimodal investigation copilot designed for law enforcement officers and forensic detectives. It processes multi-source evidence (FIR documents, crime scene photos, CCTV videos, witness audio recordings) through an 8-agent Google Gemini AI swarm to correlate facts, generate chronological timelines, flag contradictions, synthesize final dossiers, and export PDF reports.

---

## 🌟 Key Features

- **🔐 End-to-End JWT Authentication & Role-Based Access**: Persistent investigator login, bcrypt password hashing, token verification middleware.
- **🛡️ 8-Agent Multimodal AI System**:
  1. **Document Analysis Agent**: Extract text, FIR summaries, IPC/statute legal sections, dates, names.
  2. **Image Analysis Agent**: Gemini Vision identification of weapons, vehicles, blood stains, license plates, persons, and clothing.
  3. **Video Analysis Agent**: Multimodal CCTV keyframe analysis and timestamp tracking.
  4. **Audio Analysis Agent**: Witness speech transcription, quote extraction, and timeline mapping.
  5. **Evidence Correlation Agent**: Cross-modal entity linking (matching names, license plates, locations, timestamps across evidence).
  6. **Timeline Generator Agent**: Unified master chronological event timeline.
  7. **Contradiction Detection Agent**: Discrepancy flagging (e.g., Witness states "Blue Sedan" vs CCTV video showing "White SUV") with confidence ratings.
  8. **Investigation Report Generator Agent**: Compiles full executive dossier with downloadable PDF export.
- **🕸️ Connected Evidence Relationship Graph**: Interactive node-and-edge visualizer connecting matching names, vehicles, locations, dates, objects across evidence files.
- **💬 Case Context RAG AI Chatbot**: Interactive chatbot strictly scoped to uploaded evidence context.
- **📄 Instant PDF Export**: Export comprehensive case reports directly as formatted PDF documents.
- **💾 Dual Database Engine**: Integrated with Supabase PostgreSQL alongside a resilient out-of-the-box fallback store.

---

## 🔒 Mandatory Security Architecture

> [!IMPORTANT]
> The **Google Gemini API Key**, **Supabase Service Role Key**, and **JWT Secret** exist strictly in backend environment variables (`backend/.env`). The React frontend NEVER directly communicates with Gemini or database keys. All interactions pass through authenticated Express middleware.

---

## 📂 Repository Folder Structure

```
crimelensAI/
├── backend/                     # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── agents/              # 8 Multimodal AI Agents & Orchestrator
│   │   │   ├── documentAgent.ts
│   │   │   ├── imageAgent.ts
│   │   │   ├── videoAgent.ts
│   │   │   ├── audioAgent.ts
│   │   │   ├── correlationAgent.ts
│   │   │   ├── timelineAgent.ts
│   │   │   ├── contradictionAgent.ts
│   │   │   ├── reportAgent.ts
│   │   │   └── agentOrchestrator.ts
│   │   ├── config/              # Gemini SDK, Supabase & Env Config
│   │   ├── controllers/         # Auth, Case, Evidence, AI Controllers
│   │   ├── middleware/          # JWT Auth, Multer Upload, Zod Validation
│   │   ├── routes/              # Express Router endpoints
│   │   ├── services/            # Supabase Service & In-Memory Store
│   │   ├── utils/               # Zod Validators
│   │   └── index.ts             # Express Server Entry Point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── frontend/                    # React.js + Vite + Tailwind CSS UI
│   ├── src/
│   │   ├── components/          # Sidebar, Navbar, Pipeline, Graph, Timeline
│   │   ├── context/             # AuthContext (Persistent Login)
│   │   ├── pages/               # Login, Register, Dashboard, NewCase, CaseDetails, Chat, History, Profile
│   │   ├── services/            # Axios API wrappers
│   │   ├── types/               # TypeScript interface definitions
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css            # Tailwind & Cyber Visual Theme
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── supabase/
│   └── schema.sql               # Complete Supabase PostgreSQL Schema
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js** v18+ installed
- **npm** or **yarn**

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:5000`*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🔑 Environment Configuration (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=crimelens_super_secret_jwt_key_2026_investigation_copilot
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=https://your-supabase-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

---

## 📚 API Endpoint Summary

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/signup` | Register investigator account |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & receive JWT token |
| **Auth** | `GET` | `/api/auth/profile` | Retrieve active investigator profile & stats |
| **Cases** | `POST` | `/api/cases` | Create new criminal investigation case |
| **Cases** | `GET` | `/api/cases` | Query cases with search and filters |
| **Cases** | `GET` | `/api/cases/:id` | Get full case dossier with timeline & report |
| **Cases** | `DELETE`| `/api/cases/:id` | Delete investigation case |
| **Evidence**| `POST` | `/api/evidence/upload` | Upload multi-source evidence (PDF, image, video, audio) |
| **AI** | `POST` | `/api/ai/analyze` | Trigger 8-Agent Multimodal AI execution pipeline |
| **AI** | `POST` | `/api/ai/chat` | RAG evidence chatbot query |
| **AI** | `GET` | `/api/ai/report/:caseId` | Fetch generated executive investigation report |

---

## 🗄️ Database Setup (Supabase PostgreSQL)

To set up your live database on Supabase:
1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL Editor in Supabase Dashboard.
3. Paste and run the schema inside [`supabase/schema.sql`](file:///c:/Users/Godugu%20Druveen/OneDrive/Desktop/crimelensAI/supabase/schema.sql).
4. Copy your **Supabase URL** and **Service Role Key** into `backend/.env`.

---

## 📝 Demo Login Credentials

- **Email**: `investigator@crimelens.ai`
- **Password**: `password123`

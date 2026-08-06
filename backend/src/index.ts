import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { ENV } from './config/env';
import authRoutes from './routes/authRoutes';
import caseRoutes from './routes/caseRoutes';
import evidenceRoutes from './routes/evidenceRoutes';
import aiRoutes from './routes/aiRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files statically
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Health Check Endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    system: 'CrimeLens AI – Agentic Multimodal Investigation Copilot API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = parseInt(ENV.PORT, 10) || 5000;

app.listen(PORT, () => {
  console.log(`
  =============================================================
  🚨 CrimeLens AI – Agentic Multimodal Investigation Backend 🚨
  =============================================================
  • Server Running on: http://localhost:${PORT}
  • Health Endpoint:   http://localhost:${PORT}/api/health
  • Node Environment:  ${ENV.NODE_ENV}
  • Auth Endpoint:     http://localhost:${PORT}/api/auth
  • Cases Endpoint:    http://localhost:${PORT}/api/cases
  • AI Pipeline:       http://localhost:${PORT}/api/ai/analyze
  =============================================================
  `);
});

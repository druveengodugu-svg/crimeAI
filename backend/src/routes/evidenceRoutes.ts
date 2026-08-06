import { Router } from 'express';
import { uploadEvidence, getEvidenceById, analyzeEvidenceFile, deleteEvidence } from '../controllers/evidenceController';
import { uploadMiddleware } from '../middleware/upload';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.post('/upload', uploadMiddleware.array('files', 10), uploadEvidence);
router.post('/:id/analyze', analyzeEvidenceFile);
router.get('/:id', getEvidenceById);
router.delete('/:id', deleteEvidence);

export default router;

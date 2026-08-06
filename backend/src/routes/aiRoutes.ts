import { Router } from 'express';
import { analyzeCase, chatWithCase, getReport } from '../controllers/aiController';
import { authenticateJWT } from '../middleware/auth';
import { validateSchema } from '../middleware/validate';
import { AnalyzeSchema, ChatSchema } from '../utils/validators';

const router = Router();

router.use(authenticateJWT);

router.post('/analyze', validateSchema(AnalyzeSchema), analyzeCase);
router.post('/chat', validateSchema(ChatSchema), chatWithCase);
router.get('/report/:caseId', getReport);

export default router;

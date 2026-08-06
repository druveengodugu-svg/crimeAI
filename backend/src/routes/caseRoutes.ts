import { Router } from 'express';
import { createCase, getCases, getCaseById, deleteCase, loadDemoCase, updateCaseStatus } from '../controllers/caseController';
import { validateSchema } from '../middleware/validate';
import { authenticateJWT } from '../middleware/auth';
import { CaseSchema } from '../utils/validators';

const router = Router();

router.use(authenticateJWT);

router.post('/demo', loadDemoCase);
router.post('/', validateSchema(CaseSchema), createCase);
router.get('/', getCases);
router.get('/:id', getCaseById);
router.put('/:id/status', updateCaseStatus);
router.patch('/:id/status', updateCaseStatus);
router.delete('/:id', deleteCase);

export default router;


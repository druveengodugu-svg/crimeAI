import { Router } from 'express';
import { signup, login, getProfile, updateProfile, uploadAvatar, logout } from '../controllers/authController';
import { validateSchema } from '../middleware/validate';
import { authenticateJWT } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';
import { SignupSchema, LoginSchema, UpdateProfileSchema } from '../utils/validators';

const router = Router();

router.post('/signup', validateSchema(SignupSchema), signup);
router.post('/login', validateSchema(LoginSchema), login);
router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, validateSchema(UpdateProfileSchema), updateProfile);
router.post('/avatar', authenticateJWT, uploadMiddleware.single('avatar'), uploadAvatar);
router.post('/logout', authenticateJWT, logout);

export default router;

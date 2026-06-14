import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate';
import { loginSchema, registerSchema, updateProfileSchema } from '../validation/schemas';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validateBody(updateProfileSchema), updateProfile);

export default router;

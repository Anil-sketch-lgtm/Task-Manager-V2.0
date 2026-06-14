import { Router } from 'express';
import { logFocusSession } from '../controllers/focus.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate';
import { focusSessionSchema } from '../validation/schemas';

const router = Router();
router.use(authenticate);
router.post('/', validateBody(focusSessionSchema), logFocusSession);

export default router;

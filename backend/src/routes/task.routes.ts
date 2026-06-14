import { Router } from 'express';
import { getTasks, getTaskById, createTask, updateTask, deleteTask, getPrioritizedTasks } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema } from '../validation/schemas';

const router = Router();

router.use(authenticate);

router.get('/prioritized', getPrioritizedTasks); // Must come before /:id
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', validateBody(createTaskSchema), createTask);
router.put('/:id', validateBody(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);

export default router;

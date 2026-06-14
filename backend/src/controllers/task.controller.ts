import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../prisma';
import { config } from '../config';
import { buildTaskUpdateData } from './taskUpdate';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const tasks = await prisma.task.findMany({ where: { userId } });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

export const getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const taskId = parseInt(req.params.id as string);
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        
        if (!task || task.userId !== userId) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch task' });
    }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const { title, description, deadline, priority, status } = req.body;
        
        const task = await prisma.task.create({
            data: {
                userId,
                title,
                description: description ?? null,
                deadline: deadline ? new Date(deadline) : null,
                priority: priority ?? 1,
                status: status ?? 'pending'
            }
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create task' });
    }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const taskId = parseInt(req.params.id as string);
        const { status } = req.body;
        
        const existingTask = await prisma.task.findUnique({ where: { id: taskId } });
        if (!existingTask || existingTask.userId !== userId) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }

        if (status === 'completed' && existingTask.status !== 'completed') {
            const now = new Date();
            const completionTime = Math.max(0, Math.round((now.getTime() - existingTask.createdAt.getTime()) / (1000 * 60)));
            let delayFactor = null;
            if (existingTask.deadline) {
                const deadlineTime = new Date(existingTask.deadline).getTime();
                if (now.getTime() > deadlineTime) {
                    delayFactor = (now.getTime() - deadlineTime) / (1000 * 60 * 60 * 24); // days overdue
                } else {
                    delayFactor = 0.0;
                }
            }
            await prisma.userBehavior.create({
                data: {
                    userId,
                    taskId,
                    completionTime,
                    delayFactor
                }
            });
        }

        const task = await prisma.task.update({
            where: { id: taskId },
            data: buildTaskUpdateData(req.body)
        });
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const taskId = parseInt(req.params.id as string);
        
        const existingTask = await prisma.task.findUnique({ where: { id: taskId } });
        if (!existingTask || existingTask.userId !== userId) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }

        // Delete associated user behavior records first to prevent foreign key constraint violations
        await prisma.userBehavior.deleteMany({ where: { taskId } });

        await prisma.task.delete({ where: { id: taskId } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
};

// Call ML Service for Prioritization
export const getPrioritizedTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        
        // 1. Fetch pending tasks from DB
        const tasks = await prisma.task.findMany({ 
            where: { userId, status: 'pending' }
        });

        if (tasks.length === 0) {
            res.status(200).json([]);
            return;
        }

        // 2. Prepare payload for ML service
        const mlPayload = {
            tasks: tasks.map(t => ({
                id: t.id,
                title: t.title,
                deadline: t.deadline,
                priority: t.priority
            }))
        };

        // 3. Call ML service
        const mlResponse = await fetch(`${config.mlServiceUrl}/ml/prioritize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mlPayload)
        });

        if (!mlResponse.ok) {
            throw new Error(`ML Service responded with ${mlResponse.status}`);
        }

        const rankedTaskIds = await mlResponse.json() as { id: number, score: number }[];

        // 4. Map the scored order back to full task objects
        const tasksById = new Map(tasks.map(t => [t.id, t]));
        const orderedTasks = rankedTaskIds.map(ranked => ({
            ...tasksById.get(ranked.id)!,
            mlScore: ranked.score
        }));

        res.status(200).json(orderedTasks);
    } catch (error) {
        console.error("Prioritization error:", error);
        res.status(500).json({ error: 'Failed to prioritize tasks' });
    }
};

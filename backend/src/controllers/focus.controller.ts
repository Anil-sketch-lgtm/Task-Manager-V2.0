import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../prisma';

export const logFocusSession = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const { startTime, endTime, interruptions } = req.body;
        
        const session = await prisma.focusSession.create({
            data: {
                userId,
                startTime: new Date(startTime),
                endTime: endTime ? new Date(endTime) : null,
                interruptions: interruptions ?? 0
            }
        });
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: 'Failed to log focus session' });
    }
};

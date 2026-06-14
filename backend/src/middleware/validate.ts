import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

export const validateBody = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                error: 'Validation failed',
                details: result.error.flatten().fieldErrors
            });
            return;
        }

        req.body = result.data;
        next();
    };
};

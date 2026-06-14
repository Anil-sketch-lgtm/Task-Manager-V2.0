import { z } from 'zod';

const dateString = z.string().refine(value => !Number.isNaN(Date.parse(value)), {
    message: 'Invalid date'
});

export const registerSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().email('Valid email is required').toLowerCase(),
    password: z.string().min(8, 'Password must be at least 8 characters')
});

export const loginSchema = z.object({
    email: z.string().trim().email('Valid email is required').toLowerCase(),
    password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
    name: z.string().trim().min(1).optional(),
    email: z.string().trim().email().toLowerCase().optional(),
    currentPassword: z.string().min(1).optional(),
    password: z.string().min(8).optional()
}).refine(data => !data.password || data.currentPassword, {
    message: 'Current password is required to change password',
    path: ['currentPassword']
});

export const taskStatusSchema = z.enum(['pending', 'completed']);

export const createTaskSchema = z.object({
    title: z.string().trim().min(1, 'Title is required'),
    description: z.string().trim().optional().nullable(),
    deadline: dateString.optional().nullable(),
    priority: z.coerce.number().int().min(1).max(3).optional(),
    status: taskStatusSchema.optional()
});

export const updateTaskSchema = z.object({
    title: z.string().trim().min(1).optional(),
    description: z.string().trim().optional().nullable(),
    deadline: dateString.optional().nullable(),
    priority: z.coerce.number().int().min(1).max(3).optional(),
    status: taskStatusSchema.optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field is required'
});

export const focusSessionSchema = z.object({
    startTime: dateString,
    endTime: dateString.optional().nullable(),
    interruptions: z.coerce.number().int().min(0).optional()
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

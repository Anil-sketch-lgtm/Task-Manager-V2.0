import { UpdateTaskInput } from '../validation/schemas';

export const buildTaskUpdateData = (input: UpdateTaskInput) => {
    const data: {
        title?: string;
        description?: string | null;
        deadline?: Date | null;
        priority?: number;
        status?: 'pending' | 'completed';
    } = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.deadline !== undefined) data.deadline = input.deadline ? new Date(input.deadline) : null;
    if (input.priority !== undefined) data.priority = input.priority;
    if (input.status !== undefined) data.status = input.status;

    return data;
};

import fs from 'fs';
import path from 'path';
import os from 'os';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Express } from 'express';
import type { PrismaClient } from '@prisma/client';

let app: Express;
let prisma: PrismaClient;

const registerUser = async () => {
    await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: 'test@example.com', password: 'password123' })
        .expect(201);

    const login = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(200);

    return login.body.token as string;
};

beforeAll(async () => {
    const dbPath = path.join(os.tmpdir(), `task-manager-test-${Date.now()}.db`).replace(/\\/g, '/');
    process.env.DATABASE_URL = `file:${dbPath}`;
    process.env.JWT_SECRET = 'test-secret';
    process.env.FRONTEND_URL = 'http://localhost:4200';
    process.env.ML_SERVICE_URL = 'http://localhost:8000';

    prisma = (await import('../prisma')).default;
    const backendRoot = path.resolve(__dirname, '../..');
    const migration = fs.readFileSync(
        path.join(backendRoot, 'prisma', 'migrations', '20260427123857_init', 'migration.sql'),
        'utf8'
    );
    for (const statement of migration.split(';').map(sql => sql.trim()).filter(Boolean)) {
        await prisma.$executeRawUnsafe(statement);
    }

    app = (await import('../index')).default;
});

beforeEach(async () => {
    await prisma.userBehavior.deleteMany();
    await prisma.focusSession.deleteMany();
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
});

afterAll(async () => {
    await prisma?.$disconnect();
});

describe('auth flow', () => {
    it('rejects invalid registration payloads', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({ name: '', email: 'bad-email', password: 'short' })
            .expect(400);
    });

    it('registers a user, logs in, and returns the profile', async () => {
        const token = await registerUser();

        const profile = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(profile.body).toMatchObject({
            name: 'Test User',
            email: 'test@example.com'
        });
        expect(profile.body.passwordHash).toBeUndefined();
    });

    it('prevents duplicate registration', async () => {
        await registerUser();

        await request(app)
            .post('/api/auth/register')
            .send({ name: 'Test User', email: 'test@example.com', password: 'password123' })
            .expect(400);
    });

    it('rejects protected routes without a bearer token', async () => {
        await request(app).get('/api/tasks').expect(401);
    });
});

describe('task flow', () => {
    it('creates a task for the logged-in user', async () => {
        const token = await registerUser();

        const task = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Write tests', priority: 2 })
            .expect(201);

        expect(task.body).toMatchObject({
            title: 'Write tests',
            priority: 2,
            status: 'pending'
        });
    });

    it('rejects invalid task priority values', async () => {
        const token = await registerUser();

        await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Bad priority', priority: 10 })
            .expect(400);
    });

    it('supports partial completion updates without clearing task fields', async () => {
        const token = await registerUser();
        const deadline = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        const created = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Keep my fields',
                description: 'Details stay here',
                deadline,
                priority: 3
            })
            .expect(201);

        const updated = await request(app)
            .put(`/api/tasks/${created.body.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'completed' })
            .expect(200);

        expect(updated.body).toMatchObject({
            title: 'Keep my fields',
            description: 'Details stay here',
            priority: 3,
            status: 'completed'
        });
        expect(updated.body.deadline).not.toBeNull();
    });
});

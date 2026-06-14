import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            console.log(`Registration attempt failed: User with email "${email}" already exists.`);
            res.status(400).json({ error: 'User already exists' });
            return;
        }
        
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, passwordHash }
        });
        
        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
        console.error("Registration failed:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '24h' });
        res.status(200).json({ message: 'Logged in successfully', token });
    } catch (error) {
        console.error("Login failed:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Get profile failed:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { name, email, currentPassword, password } = req.body;

        if (email) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser && existingUser.id !== userId) {
                res.status(400).json({ error: 'Email is already taken' });
                return;
            }
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (password) {
            if (!currentPassword) {
                res.status(400).json({ error: 'Current password is required to change password' });
                return;
            }
            const dbUser = await prisma.user.findUnique({ where: { id: userId } });
            if (!dbUser) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            const valid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
            if (!valid) {
                res.status(400).json({ error: 'Incorrect current password' });
                return;
            }
            updateData.passwordHash = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: { id: true, name: true, email: true }
        });

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error("Update profile failed:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

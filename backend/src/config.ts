import 'dotenv/config';

const requiredEnv = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} environment variable is required`);
    }
    return value;
};

export const config = {
    jwtSecret: requiredEnv('JWT_SECRET'),
    port: process.env.PORT || '3000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
    mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8000'
};

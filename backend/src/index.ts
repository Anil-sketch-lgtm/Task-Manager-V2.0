import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import focusRoutes from './routes/focus.routes';
import { config } from './config';

const app = express();

app.use(cors({ origin: config.frontendUrl }));
app.use(helmet());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/focus', focusRoutes);

app.get('/health', (req, res) => {
  res.send('Server is running');
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
}

export default app;

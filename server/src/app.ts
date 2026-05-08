import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';

// routers
import {router as scheduleRoutes} from './routes/schedule.routes';
import authRoutes from './routes/auth.routes';
import {router as userRoutes} from './routes/user.routes';
import {router as activityRoutes} from './routes/activity.routes'


export const app = express();



// Middleware
app.use(cors({ origin: process.env['CLIENT_URL'] || 'http://localhost:5173' }));
app.use(express.json());

// Health check (before routes so it's always reachable)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
// TODO: Wire in route modules once they exist (Steps 4-6)
app.use('/api/activities', activityRoutes);//for leaders and above
app.use('/api/schedules', scheduleRoutes);
app.use('/api/users', userRoutes);

// 404 catch-all (must be last route)
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found', statusCode: 404 });
});

// Global error handler (must be last middleware)
app.use(errorHandler);

import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';

// routers
import authRoutes from './routes/auth.routes';
import activityRoutes from './routes/activities.routes';

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
app.use('/api/activities', activityRoutes);
// TODO: app.use('/api/schedules', scheduleRoutes);
// TODO: app.use('/api/users', userRoutes);

// 404 catch-all (must be last route)
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found', statusCode: 404 });
});

// Global error handler (must be last middleware)
app.use(errorHandler);

import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

// Middleware
app.use(cors({ origin: process.env['CLIENT_URL'] || 'http://localhost:5173' }));
app.use(express.json());

// Health check (before routes so it's always reachable)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
// TODO: Wire in route modules once they exist (Steps 4-6)
// app.use('/api/activities', activityRoutes);
// app.use('/api/schedules', scheduleRoutes);
// app.use('/api/users', userRoutes);

// 404 catch-all (must be last route)
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler (must be last middleware)
app.use(errorHandler);

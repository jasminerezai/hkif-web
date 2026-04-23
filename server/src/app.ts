import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db/connection';
import authRoutes from './routes/auth';
import activityRoutes from './routes/activities';
import userRoutes from './routes/users';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/users', userRoutes);

// For routes that dont exist
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

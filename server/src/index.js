import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import helmet from 'helmet';
import { connectDB } from './config/db.js';

import complaintRoutes from './routes/complaintRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Production Security Headers & Gzip/Brotli Compression
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false // Allows Leaflet tile maps, external font CDNs & base64 camera previews
  })
);
app.use(compression());

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true
  })
);
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

import { groqService } from './services/groqService.js';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CivicLens API Server',
    database: 'MongoDB Active',
    timestamp: new Date().toISOString()
  });
});

// Groq AI Status endpoint
app.get('/api/groq/status', (req, res) => {
  res.json({
    success: true,
    groq: groqService.getStatus()
  });
});

// API Routes
app.use('/api/complaints', complaintRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Endpoint ${req.originalUrl} not found` });
});

import { ensureSingleAdmin } from './services/adminService.js';

// Start Server & Connect MongoDB
const startServer = async () => {
  await connectDB();
  await ensureSingleAdmin();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(` CivicLens Backend Server running on port ${PORT}`);
    console.log(` Local:   http://localhost:${PORT}/api/health`);
    console.log(` MongoDB: ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civiclens'}`);
    console.log(`===============================================`);
  });
};

startServer();

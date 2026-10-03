import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { startKeepAliveService } from './services/keepAliveService.js';
import authRoutes from './routes/authRoutes.js';
import kavitaRoutes from './routes/kavitaRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Root & Keep-Alive Ping Endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'Mukt Kavya Backend System',
    message: 'Welcome to Mukt Kavya API — The Indian Literary Sanctuary',
    timestamp: new Date().toISOString(),
  });
});

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'Mukt Kavya Backend System',
    timestamp: new Date().toISOString(),
    brevoStatus: process.env.BREVO_API_KEY && !process.env.BREVO_API_KEY.includes('demo') ? 'Configured' : 'Simulation Mode',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/kavitas', kavitaRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`✨ Mukt Kavya API Server is running on port ${PORT}`);
      console.log(`🌐 Local URL: http://localhost:${PORT}`);
      console.log(`📖 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`⚡ Keep-Alive Ping: http://localhost:${PORT}/ping`);
      console.log(`======================================================\n`);

      // Initialize automated Render keep-alive monitor (bypasses 15-minute cold starts)
      startKeepAliveService();
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

startServer();

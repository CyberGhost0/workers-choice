import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { initializeRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { httpsEnforcement } from './middleware/httpsEnforcement';
import { setupSocketHandlers } from './services/socketService';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || [
      process.env.APP_URL || 'http://localhost:3000',
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// HTTPS enforcement (production only)
app.use(httpsEnforcement);

// Security middleware
// NOTE: `upgrade-insecure-requests` is disabled because the app is served over
// plain HTTP on the local network. When enabled, mobile browsers auto-upgrade
// API calls to https:// (which we don't serve), breaking login over LAN IP.
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'upgrade-insecure-requests': null,
      },
    },
  })
);

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Stricter rate limiting for auth endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

// CORS - allow network access for stress testing
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
  process.env.APP_URL || 'http://localhost:3000',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, health checks)
      // but only if explicitly configured
      if (!origin && process.env.NODE_ENV === 'production') {
        callback(new Error('Not allowed by CORS'));
        return;
      }
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve locally-uploaded files (Cloudinary fallback)
// Resolve from project root (server/) so it works whether running from
// dist/ or src/ in dev.
const PROJECT_ROOT = path.resolve(__dirname, '..');
app.use('/uploads', express.static(path.join(PROJECT_ROOT, 'public', 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
initializeRoutes(app);

// Socket.IO handlers
setupSocketHandlers(io);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = parseInt(process.env.PORT || '4000', 10);

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    console.log('✅ Database connected');

    // Connect to Redis (optional - don't fail if unavailable)
    try {
      await connectRedis();
      console.log('✅ Redis connected');
    } catch (err) {
      console.warn('⚠️  Redis unavailable, running without cache/session store');
    }

    // Start HTTP server - bind to 0.0.0.0 for network access
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}`);
      console.log(`🌐 Network access at http://0.0.0.0:${PORT}`);
      console.log(`🔌 WebSocket ready for connections`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Safety net: never let a single rejected promise or thrown async error
// crash the entire server process.
process.on('unhandledRejection', (reason) => {
  console.error('⚠️  Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('⚠️  Uncaught exception:', error);
});

startServer();

export { app, httpServer, io };

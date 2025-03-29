import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Import configurations
import connectDb from './src/config/db.config.js';
import { logger } from './src/utils/logger.js';

// Import middleware
import { errorHandler, notFoundHandler } from './src/middleware/error.middleware.js';
import { requestLogger } from './src/middleware/logging.middleware.js';

// Import route modules
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import patientRoutes from './src/routes/patient.routes.js';
import doctorRoutes from './src/routes/doctor.routes.js';
import appointmentRoutes from './src/routes/appointment.routes.js';
import telemedicineRoutes from './src/routes/telemedicine.routes.js';
import prescriptionRoutes from './src/routes/prescription.routes.js';
import labTestRoutes from './src/routes/labTest.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';
// import chatRoutes from './src/routes/chat.routes.js';
import paymentRoutes from './src/routes/payment.routes.js';
import adminRoutes from './src/routes/admin.routes.js';

// Load environment variables
dotenv.config();

// Initialize express app and HTTP server
const app = express();
const httpServer = createServer(app);

// Configure Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000
});

// Make io accessible to route handlers
app.set('io', io);

// File path configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
}));

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// Logging middleware
app.use(morgan('dev'));
app.use(requestLogger);

// Static files serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'MediMantra API is operational',
    time: new Date().toISOString()
  });
});

// API routes
const apiRouter = express.Router();

// Mount all route modules to the API router

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/patients', patientRoutes);
apiRouter.use('/doctors', doctorRoutes);
apiRouter.use('/appointments', appointmentRoutes);
apiRouter.use('/telemedicine', telemedicineRoutes);
apiRouter.use('/prescriptions', prescriptionRoutes);
apiRouter.use('/lab-tests', labTestRoutes);
apiRouter.use('/notifications', notificationRoutes);
// apiRouter.use('/chat', chatRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/admin', adminRoutes);

// Mount API router to main app
app.use('/api', apiRouter);
app.get('/',(req, res) => {
  res.status(200).json({ message: 'Welcome to MediMantra API' });
})
// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Socket.IO event handling
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  
  // Join personal room
  socket.on('join', (userId) => {
    socket.join(userId);
    logger.debug(`User ${userId} joined personal room`);
  });
  
  // Join chat room
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    logger.debug(`Socket ${socket.id} joined chat: ${chatId}`);
  });
  
  // Handle new message
  socket.on('new_message', (message) => {
    io.to(message.chat).emit('message_received', message);
  });
  
  // Join telemedicine session
  socket.on('join_telemedicine', (sessionId) => {
    socket.join(`telemedicine:${sessionId}`);
    logger.debug(`Socket ${socket.id} joined telemedicine session: ${sessionId}`);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    // Connect to database
    await connectDb();
    
    // Start HTTP server
    const server = httpServer.listen(PORT, () => {
      logger.info(`
🚀 MediMantra Server started successfully
📡 PORT: ${PORT}
🔊 MODE: ${process.env.NODE_ENV}
⚡ API: http://localhost:${PORT}/api
      `);
    });
    
    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      // Close HTTP server first to stop accepting new connections
      server.close(() => {
        logger.info('HTTP server closed.');
        
        // Close Socket.IO connections
        io.close(() => {
          logger.info('Socket.IO connections closed.');
          
          // Add any other cleanup here (e.g., database connection)
          logger.info('Graceful shutdown completed.');
          process.exit(0);
        });
      });
      
      // Force shutdown after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        logger.error('Forceful shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };
    
    // Register shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    logger.error('Server startup error:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Start the server
startServer();

export default app;
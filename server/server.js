import express from 'express';
import { createServer } from 'http';
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
import { corsOptions, rateLimitOptions } from './src/config/server.config.js';
import connectDb from './src/config/db.config.js';

// Import routes
 import authRoutes from './routes/auth.routes.js';
// import messageRoutes from './routes/message.routes.js';
// import userRoutes from './routes/user.routes.js';
// import chatRoutes from './routes/chat.routes.js';

// Import middleware
 import { errorHandler, notFoundHandler } from './src/middleware/error.middleware.js';
 import { requestLogger } from './src/middleware/logging.middleware.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Connect to database
connectDb().then(() => {
  console.log('📦 Connected to MongoDB');
}).catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Configure Socket.IO
// const io = configureSocket(httpServer);
// app.set('io', io);

// File path configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(rateLimit(rateLimitOptions));

// Request parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(compression());

// Logging middleware
app.use(morgan('dev'));
app.use(requestLogger);

// API routes
const apiRouter = express.Router();

//apiRouter.use('/auth', authRoutes);

// apiRouter.use('/messages', messageRoutes);
// apiRouter.use('/users', userRoutes);
// apiRouter.use('/chat', chatRoutes);

// Mount API routes
app.use('/api', apiRouter);

// Serve static files in production
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../client/dist')));
//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
//   });
// }

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    httpServer.listen(PORT, () => {
      console.log(`
🚀 Server is running!
📡 PORT: ${PORT}
🔊 MODE: ${process.env.NODE_ENV}
⚡ API: http://localhost:${PORT}/api
      `);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

startServer();

export default app;
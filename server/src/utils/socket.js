import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

// Socket connection handler
const initializeSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication token is required'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('User not found'));
      }
      
      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error('Authentication error: ' + error.message));
    }
  });

  // Handle connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user._id}`);
    
    // Join personal room
    socket.join(socket.user._id.toString());
    
    // Handle telemedicine session
    socket.on('join-telemedicine', (roomId) => {
      socket.join(`telemedicine:${roomId}`);
      socket.to(`telemedicine:${roomId}`).emit('user-joined', {
        userId: socket.user._id,
        name: `${socket.user.firstName} ${socket.user.lastName}`,
        role: socket.user.role
      });
    });
    
    // Handle chat message
    socket.on('send-message', (data) => {
      const { recipient, message, appointmentId } = data;
      socket.to(recipient).emit('receive-message', {
        sender: socket.user._id,
        senderName: `${socket.user.firstName} ${socket.user.lastName}`,
        message,
        appointmentId,
        timestamp: new Date()
      });
    });
    
    // Handle video/audio signals
    socket.on('signal', (data) => {
      const { roomId, signal } = data;
      socket.to(`telemedicine:${roomId}`).emit('signal', {
        userId: socket.user._id,
        signal
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user._id}`);
    });
  });

  return io;
};

export default initializeSocketServer;

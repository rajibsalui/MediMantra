import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';

// Map to store active users and their socket IDs
const activeUsers = new Map();

// Map to store user roles for quick access
const userRoles = new Map();

/**
 * Emit pending chat requests to a doctor
 * @param {Object} socket - Socket.io socket object for the doctor
 */
const emitPendingChatRequests = async (socket) => {
  try {
    const doctorId = socket.user._id;

    // Find all pending conversations where the doctor is a participant
    const pendingRequests = await Conversation.find({
      participants: doctorId,
      status: 'pending',
      isActive: true
    })
      .populate('participants', 'firstName lastName profileImage role')
      .populate('initiator', 'firstName lastName')
      .sort({ createdAt: -1 });

    if (pendingRequests.length > 0) {
      // Format requests for client
      const formattedRequests = pendingRequests.map(request => {
        // Get the patient (the other participant)
        const patient = request.participants.find(
          p => p._id.toString() !== doctorId.toString()
        );

        return {
          conversationId: request._id,
          patient: {
            _id: patient._id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            profileImage: patient.profileImage
          },
          timestamp: request.createdAt
        };
      });

      // Send pending requests to doctor
      socket.emit('pendingChatRequests', formattedRequests);
    }
  } catch (error) {
    console.error('Error emitting pending chat requests:', error);
  }
};

/**
 * Authenticate socket connection using JWT token
 * @param {Object} socket - Socket.io socket object
 * @returns {Promise<Object|null>} - User object if authenticated, null otherwise
 */
const authenticateSocket = async (socket) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Socket authentication error:', error.message);
    return null;
  }
};

/**
 * Setup Socket.io event handlers
 * @param {Object} io - Socket.io server instance
 */
export const setupSocketHandlers = (io) => {
  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const user = await authenticateSocket(socket);
      if (!user) {
        return next(new Error('Authentication error'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.user._id}`);

    // Add user to active users map
    activeUsers.set(socket.user._id.toString(), socket.id);

    // Emit online users to all connected clients
    io.emit('userStatus', Array.from(activeUsers.keys()));

    // If user is a doctor, send pending chat requests
    if (socket.user.role === 'doctor') {
      emitPendingChatRequests(socket);
    }

    // Handle private message
    socket.on('sendMessage', async (data) => {
      try {
        const { receiverId, content, attachments = [] } = data;

        if (!receiverId || !content) {
          socket.emit('messageError', { error: 'Receiver ID and content are required' });
          return;
        }

        // Find or create conversation
        let conversation = await Conversation.findOne({
          participants: { $all: [socket.user._id, receiverId] }
        });

        if (!conversation) {
          conversation = await Conversation.create({
            participants: [socket.user._id, receiverId],
            unreadCount: new Map([[receiverId, 1]])
          });
        } else {
          // Update unread count for receiver
          const currentCount = conversation.unreadCount.get(receiverId) || 0;
          conversation.unreadCount.set(receiverId, currentCount + 1);
          await conversation.save();
        }

        // Create new message
        const newMessage = await Message.create({
          sender: socket.user._id,
          receiver: receiverId,
          content,
          attachments,
          conversation: conversation._id
        });

        // Update conversation with last message
        conversation.lastMessage = newMessage._id;
        await conversation.save();

        // Populate sender info
        const populatedMessage = await Message.findById(newMessage._id)
          .populate('sender', 'firstName lastName profileImage role')
          .populate('receiver', 'firstName lastName profileImage role');

        // Send message to receiver if online
        const receiverSocketId = activeUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('newMessage', populatedMessage);
        }

        // Send confirmation to sender
        socket.emit('messageSent', populatedMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('messageError', { error: 'Failed to send message' });
      }
    });

    // Handle message read status
    socket.on('markAsRead', async (data) => {
      try {
        const { messageId } = data;

        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('readError', { error: 'Message not found' });
          return;
        }

        // Only the receiver can mark a message as read
        if (message.receiver.toString() !== socket.user._id.toString()) {
          socket.emit('readError', { error: 'Unauthorized' });
          return;
        }

        message.isRead = true;
        message.readAt = new Date();
        await message.save();

        // Update conversation unread count
        if (message.conversation) {
          const conversation = await Conversation.findById(message.conversation);
          if (conversation) {
            const currentCount = conversation.unreadCount.get(socket.user._id.toString()) || 0;
            if (currentCount > 0) {
              conversation.unreadCount.set(socket.user._id.toString(), currentCount - 1);
              await conversation.save();
            }
          }
        }

        // Notify sender if online
        const senderSocketId = activeUsers.get(message.sender.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit('messageRead', { messageId });
        }

        socket.emit('messageMarkedAsRead', { messageId });
      } catch (error) {
        console.error('Error marking message as read:', error);
        socket.emit('readError', { error: 'Failed to mark message as read' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { receiverId } = data;
      const receiverSocketId = activeUsers.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', {
          userId: socket.user._id,
          typing: true
        });
      }
    });

    socket.on('stopTyping', (data) => {
      const { receiverId } = data;
      const receiverSocketId = activeUsers.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', {
          userId: socket.user._id,
          typing: false
        });
      }
    });

    // Handle chat request from patient to doctor
    socket.on('requestChat', async (data) => {
      try {
        const { doctorId } = data;
        const patientId = socket.user._id;

        // Verify user is a patient
        if (socket.user.role !== 'patient') {
          socket.emit('requestError', { error: 'Only patients can request chats with doctors' });
          return;
        }

        // Find or create conversation with pending status
        let conversation = await Conversation.findOne({
          participants: { $all: [patientId, doctorId] },
          isActive: true
        });

        if (conversation) {
          // If already accepted, no need to request again
          if (conversation.status === 'accepted') {
            socket.emit('requestResponse', {
              status: 'accepted',
              conversationId: conversation._id,
              message: 'Conversation already exists'
            });
            return;
          }

          // Update status to pending if rejected before
          if (conversation.status === 'rejected') {
            conversation.status = 'pending';
            await conversation.save();
          }
        } else {
          // Create new conversation with pending status
          conversation = await Conversation.create({
            participants: [patientId, doctorId],
            initiator: patientId,
            status: 'pending',
            unreadCount: new Map()
          });
        }

        // Populate conversation details
        conversation = await Conversation.findById(conversation._id)
          .populate('participants', 'firstName lastName profileImage role')
          .populate('initiator', 'firstName lastName');

        // Notify doctor if online
        const doctorSocketId = activeUsers.get(doctorId.toString());
        if (doctorSocketId) {
          // Get patient info
          const patient = conversation.participants.find(
            p => p._id.toString() === patientId.toString()
          );

          io.to(doctorSocketId).emit('chatRequest', {
            conversationId: conversation._id,
            patient: {
              _id: patient._id,
              firstName: patient.firstName,
              lastName: patient.lastName,
              profileImage: patient.profileImage
            },
            timestamp: conversation.updatedAt
          });
        }

        // Confirm to patient
        socket.emit('requestResponse', {
          status: 'pending',
          conversationId: conversation._id,
          message: 'Chat request sent to doctor'
        });
      } catch (error) {
        console.error('Error handling chat request:', error);
        socket.emit('requestError', { error: 'Failed to send chat request' });
      }
    });

    // Handle doctor response to chat request
    socket.on('respondToRequest', async (data) => {
      try {
        const { conversationId, status } = data;
        const doctorId = socket.user._id;

        // Verify user is a doctor
        if (socket.user.role !== 'doctor') {
          socket.emit('responseError', { error: 'Only doctors can respond to chat requests' });
          return;
        }

        // Validate status
        if (!status || !['accepted', 'rejected'].includes(status)) {
          socket.emit('responseError', { error: 'Invalid status' });
          return;
        }

        // Find the conversation
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: doctorId,
          status: 'pending'
        });

        if (!conversation) {
          socket.emit('responseError', { error: 'Conversation request not found or already processed' });
          return;
        }

        // Update status
        conversation.status = status;
        await conversation.save();

        // Get the patient
        const patientId = conversation.participants.find(
          id => id.toString() !== doctorId.toString()
        );

        // Notify patient if online
        const patientSocketId = activeUsers.get(patientId.toString());
        if (patientSocketId) {
          io.to(patientSocketId).emit('requestStatusUpdate', {
            conversationId,
            status,
            message: `Doctor has ${status} your chat request`
          });
        }

        // Confirm to doctor
        socket.emit('responseConfirmation', {
          conversationId,
          status,
          message: `Chat request ${status}`
        });
      } catch (error) {
        console.error('Error responding to chat request:', error);
        socket.emit('responseError', { error: 'Failed to respond to chat request' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user._id}`);

      // Remove user from active users and roles
      activeUsers.delete(socket.user._id.toString());
      userRoles.delete(socket.user._id.toString());

      // Notify all users about status change
      io.emit('userStatus', Array.from(activeUsers.keys()));
    });
  });
};

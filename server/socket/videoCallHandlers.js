import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import CallRecord from '../models/callRecord.model.js';

// Map to store active video call users and their socket IDs
const activeCallUsers = new Map();

// Map to store peer IDs for users
const userPeerIds = new Map();

/**
 * Setup Socket.io event handlers for video calls
 * @param {Object} io - Socket.io server instance
 */
export const setupVideoCallHandlers = (io) => {
  // Use the main socket.io instance instead of a namespace
  console.log('Setting up video call handlers on main socket.io instance');

  // We'll handle video call events on the main socket connection
  io.on('connection', async (socket) => {
    // The user should already be authenticated by the main socket middleware
    if (!socket.user) {
      console.error('Socket connected without user data');
      return;
    }

    const userId = socket.user._id.toString();
    const userRole = socket.user.role;
    const userName = `${socket.user.firstName} ${socket.user.lastName}`;

    console.log(`User connected for video calls: ${userId} (${userRole} - ${userName})`);
    console.log('Socket ID:', socket.id);

    // Add user to active call users map
    activeCallUsers.set(userId, socket.id);

    // Log all active users after adding this user
    console.log('Updated active users:', Array.from(activeCallUsers.entries()).map(([id, socketId]) => {
      return `${id}: ${socketId}`;
    }));

    // Handle registering peer ID
    socket.on('registerPeerId', (data) => {
      const { peerId } = data;

      if (peerId) {
        userPeerIds.set(socket.user._id.toString(), peerId);
        console.log(`Registered peer ID for user ${socket.user._id}: ${peerId}`);
      }
    });

    // Handle call request
    socket.on('callUser', async (data) => {
      const { receiverId, callType, callerName } = data;
      const callerId = socket.user._id.toString();

      console.log(`Call request from ${callerId} (${callerName}) to ${receiverId} (${callType})`);
      console.log('Active users:', Array.from(activeCallUsers.entries()));

      // Check if receiver is online
      const receiverSocketId = activeCallUsers.get(receiverId);

      console.log(`Looking for receiver ${receiverId} in active users map`);
      console.log('Current active users:', Array.from(activeCallUsers.entries()));

      if (receiverSocketId) {
        console.log(`Receiver ${receiverId} is online with socket ID ${receiverSocketId}`);

        // Send call request to receiver
        const callData = {
          callerId,
          callerName,
          callType
        };

        console.log('Emitting incomingCall event with data:', callData);
        console.log('Emitting to socket ID:', receiverSocketId);

        // Try both direct socket and broadcast methods
        io.to(receiverSocketId).emit('incomingCall', callData);

        // Also try a broadcast to all sockets as a fallback
        socket.broadcast.emit('incomingCall', {
          ...callData,
          receiverId, // Add receiverId so clients can filter
          isBroadcast: true // Mark as broadcast so clients can filter
        });

        console.log(`Call request sent from ${callerId} to ${receiverId}`);
      } else {
        // Receiver is offline, send rejection back to caller
        socket.emit('callRejected', {
          reason: 'User is offline'
        });

        // Save missed call record
        try {
          await CallRecord.create({
            caller: callerId,
            receiver: receiverId,
            startTime: new Date(),
            endTime: new Date(),
            duration: 0,
            callType,
            status: 'missed'
          });
        } catch (error) {
          console.error('Error saving missed call record:', error);
        }
      }
    });

    // Handle call answer
    socket.on('answerCall', (data) => {
      const { callerId, peerId } = data;
      const receiverId = socket.user._id.toString();

      // Get caller socket ID
      const callerSocketId = activeCallUsers.get(callerId);

      if (callerSocketId) {
        // Send acceptance to caller with receiver's peer ID
        io.to(callerSocketId).emit('callAccepted', {
          receiverId,
          receiverPeerId: peerId
        });

        console.log(`Call accepted by ${receiverId}`);
      }
    });

    // Handle call rejection
    socket.on('rejectCall', (data) => {
      const { callerId, reason } = data;

      // Get caller socket ID
      const callerSocketId = activeCallUsers.get(callerId);

      if (callerSocketId) {
        // Send rejection to caller
        io.to(callerSocketId).emit('callRejected', {
          reason: reason || 'Call rejected'
        });

        console.log(`Call rejected by ${socket.user._id}`);
      }

      // Save rejected call record
      try {
        CallRecord.create({
          caller: callerId,
          receiver: socket.user._id,
          startTime: new Date(),
          endTime: new Date(),
          duration: 0,
          callType: 'video', // Default to video
          status: 'rejected'
        });
      } catch (error) {
        console.error('Error saving rejected call record:', error);
      }
    });

    // Handle call end
    socket.on('endCall', (data) => {
      const { userId } = data;

      // Get other user's socket ID
      const otherSocketId = activeCallUsers.get(userId);

      if (otherSocketId) {
        // Notify other user that call has ended
        io.to(otherSocketId).emit('callEnded');

        console.log(`Call ended by ${socket.user._id}`);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected from video calls: ${socket.user._id}`);

      // Remove user from active call users map
      activeCallUsers.delete(socket.user._id.toString());

      // Remove user's peer ID
      userPeerIds.delete(socket.user._id.toString());
    });
  });
};

export default setupVideoCallHandlers;

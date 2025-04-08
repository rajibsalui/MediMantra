import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

/**
 * Get all conversations for the current user
 * @route GET /api/messages/conversations
 */
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    })
      .populate('participants', 'firstName lastName profileImage role')
      .populate({
        path: 'lastMessage',
        select: 'content createdAt isRead sender',
        populate: {
          path: 'sender',
          select: 'firstName lastName'
        }
      })
      .sort({ updatedAt: -1 });

    // Format conversations for client
    const formattedConversations = conversations.map(conversation => {
      // Get the other participant (not the current user)
      const otherParticipant = conversation.participants.find(
        p => p._id.toString() !== userId.toString()
      );

      return {
        _id: conversation._id,
        participant: otherParticipant,
        lastMessage: conversation.lastMessage,
        unreadCount: conversation.unreadCount.get(userId.toString()) || 0,
        updatedAt: conversation.updatedAt
      };
    });

    res.status(200).json({
      success: true,
      data: formattedConversations
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations',
      error: error.message
    });
  }
};

/**
 * Get messages for a specific conversation
 * @route GET /api/messages/conversations/:conversationId
 */
export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Validate conversation ID
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation ID'
      });
    }

    // Check if user is a participant in the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or you are not a participant'
      });
    }

    // Get messages for the conversation
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'firstName lastName profileImage role')
      .populate('receiver', 'firstName lastName profileImage role')
      .sort({ createdAt: 1 });

    // Mark unread messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: userId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    // Reset unread count for this user in the conversation
    conversation.unreadCount.set(userId.toString(), 0);
    await conversation.save();

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation messages',
      error: error.message
    });
  }
};

/**
 * Request a new conversation with a doctor
 * @route POST /api/messages/conversations/request
 */
export const requestConversation = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const patientId = req.user._id;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required'
      });
    }

    // Validate doctor ID
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID'
      });
    }

    // Check if doctor exists and is a doctor
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if patient's role is actually patient
    const patient = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patient) {
      return res.status(403).json({
        success: false,
        message: 'Only patients can request conversations with doctors'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [patientId, doctorId] },
      isActive: true
    });

    if (conversation) {
      // If conversation exists and is already accepted, return it
      if (conversation.status === 'accepted') {
        conversation = await Conversation.findById(conversation._id)
          .populate('participants', 'firstName lastName profileImage role')
          .populate({
            path: 'lastMessage',
            select: 'content createdAt isRead sender',
            populate: {
              path: 'sender',
              select: 'firstName lastName'
            }
          });

        const otherParticipant = conversation.participants.find(
          p => p._id.toString() !== patientId.toString()
        );

        const formattedConversation = {
          _id: conversation._id,
          participant: otherParticipant,
          lastMessage: conversation.lastMessage || null,
          status: conversation.status,
          unreadCount: conversation.unreadCount.get(patientId.toString()) || 0,
          updatedAt: conversation.updatedAt
        };

        return res.status(200).json({
          success: true,
          data: formattedConversation
        });
      }

      // If conversation exists but is pending or rejected, update status to pending
      if (conversation.status === 'rejected') {
        conversation.status = 'pending';
        await conversation.save();
      }

      // Return the pending conversation
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'firstName lastName profileImage role');

      const otherParticipant = conversation.participants.find(
        p => p._id.toString() !== patientId.toString()
      );

      const formattedConversation = {
        _id: conversation._id,
        participant: otherParticipant,
        lastMessage: null,
        status: conversation.status,
        unreadCount: 0,
        updatedAt: conversation.updatedAt
      };

      return res.status(200).json({
        success: true,
        data: formattedConversation,
        message: 'Chat request is pending doctor approval'
      });
    }

    // If conversation doesn't exist, create a new one with pending status
    conversation = await Conversation.create({
      participants: [patientId, doctorId],
      initiator: patientId,
      status: 'pending',
      unreadCount: new Map()
    });

    // Populate the newly created conversation
    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'firstName lastName profileImage role');

    // Format conversation for client
    const otherParticipant = conversation.participants.find(
      p => p._id.toString() !== patientId.toString()
    );

    const formattedConversation = {
      _id: conversation._id,
      participant: otherParticipant,
      lastMessage: null,
      status: 'pending',
      unreadCount: 0,
      updatedAt: conversation.updatedAt
    };

    res.status(201).json({
      success: true,
      data: formattedConversation,
      message: 'Chat request sent to doctor'
    });
  } catch (error) {
    console.error('Error requesting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request conversation',
      error: error.message
    });
  }
};

/**
 * Accept or reject a conversation request
 * @route PATCH /api/messages/conversations/:conversationId/respond
 */
export const respondToConversationRequest = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    const doctorId = req.user._id;

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status (accepted or rejected) is required'
      });
    }

    // Validate conversation ID
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation ID'
      });
    }

    // Check if conversation exists and doctor is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: doctorId,
      status: 'pending'
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation request not found or already processed'
      });
    }

    // Check if user is a doctor
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can respond to conversation requests'
      });
    }

    // Update conversation status
    conversation.status = status;
    await conversation.save();

    // Return updated conversation
    const updatedConversation = await Conversation.findById(conversationId)
      .populate('participants', 'firstName lastName profileImage role');

    // Get the patient (the other participant)
    const patient = updatedConversation.participants.find(
      p => p._id.toString() !== doctorId.toString()
    );

    res.status(200).json({
      success: true,
      data: {
        _id: updatedConversation._id,
        participant: patient,
        status: updatedConversation.status,
        updatedAt: updatedConversation.updatedAt
      },
      message: `Conversation request ${status}`
    });
  } catch (error) {
    console.error('Error responding to conversation request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to conversation request',
      error: error.message
    });
  }
};

/**
 * Get all conversation requests for a doctor
 * @route GET /api/messages/conversations/requests
 */
export const getConversationRequests = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // Check if user is a doctor
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can view conversation requests'
      });
    }

    // Find all pending conversations where the doctor is a participant
    const requests = await Conversation.find({
      participants: doctorId,
      status: 'pending',
      isActive: true
    })
      .populate('participants', 'firstName lastName profileImage role')
      .populate('initiator', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Format requests for client
    const formattedRequests = requests.map(request => {
      // Get the patient (the other participant)
      const patient = request.participants.find(
        p => p._id.toString() !== doctorId.toString()
      );

      return {
        _id: request._id,
        patient: patient,
        initiator: request.initiator,
        createdAt: request.createdAt
      };
    });

    res.status(200).json({
      success: true,
      data: formattedRequests
    });
  } catch (error) {
    console.error('Error getting conversation requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation requests',
      error: error.message
    });
  }
};

/**
 * Start a new conversation or get existing one (for doctor-initiated conversations)
 * @route POST /api/messages/conversations
 */
export const startConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user._id;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    // Validate participant ID
    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid participant ID'
      });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    // Check if user is a doctor
    const doctor = await User.findOne({ _id: userId, role: 'doctor' });
    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can initiate conversations directly'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] },
      isActive: true
    })
      .populate('participants', 'firstName lastName profileImage role')
      .populate({
        path: 'lastMessage',
        select: 'content createdAt isRead sender',
        populate: {
          path: 'sender',
          select: 'firstName lastName'
        }
      });

    // If conversation exists, update status to accepted if pending
    if (conversation) {
      if (conversation.status === 'pending') {
        conversation.status = 'accepted';
        await conversation.save();
      }
    } else {
      // If conversation doesn't exist, create a new one with accepted status
      conversation = await Conversation.create({
        participants: [userId, participantId],
        initiator: userId,
        status: 'accepted',
        unreadCount: new Map()
      });

      // Populate the newly created conversation
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'firstName lastName profileImage role');
    }

    // Format conversation for client
    const otherParticipant = conversation.participants.find(
      p => p._id.toString() !== userId.toString()
    );

    const formattedConversation = {
      _id: conversation._id,
      participant: otherParticipant,
      lastMessage: conversation.lastMessage || null,
      status: conversation.status,
      unreadCount: conversation.unreadCount.get(userId.toString()) || 0,
      updatedAt: conversation.updatedAt
    };

    res.status(200).json({
      success: true,
      data: formattedConversation
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start conversation',
      error: error.message
    });
  }
};

/**
 * Send a message via HTTP (fallback for when socket is not available)
 * @route POST /api/messages
 */
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, attachments = [] } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and content are required'
      });
    }

    // Validate receiver ID
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receiver ID'
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
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
      sender: senderId,
      receiver: receiverId,
      content,
      attachments,
      conversation: conversation._id
    });

    // Update conversation with last message
    conversation.lastMessage = newMessage._id;
    await conversation.save();

    // Populate sender and receiver info
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'firstName lastName profileImage role')
      .populate('receiver', 'firstName lastName profileImage role');

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

/**
 * Mark a message as read
 * @route PATCH /api/messages/:messageId/read
 */
export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    // Validate message ID
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message ID'
      });
    }

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the receiver
    if (message.receiver.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only mark messages sent to you as read'
      });
    }

    // Mark as read if not already
    if (!message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await message.save();

      // Update conversation unread count
      if (message.conversation) {
        const conversation = await Conversation.findById(message.conversation);
        if (conversation) {
          const currentCount = conversation.unreadCount.get(userId.toString()) || 0;
          if (currentCount > 0) {
            conversation.unreadCount.set(userId.toString(), currentCount - 1);
            await conversation.save();
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
};

/**
 * Delete a conversation (soft delete)
 * @route DELETE /api/messages/conversations/:conversationId
 */
export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Validate conversation ID
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation ID'
      });
    }

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or you are not a participant'
      });
    }

    // Soft delete the conversation
    conversation.isActive = false;
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete conversation',
      error: error.message
    });
  }
};

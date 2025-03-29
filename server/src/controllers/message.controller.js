import mongoose from 'mongoose';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import { uploadFile } from '../utils/uploadFile.js';

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { sender, content, messageType = 'text' } = req.body;
    const senderId = sender;
    const receiverId = req.params.userId;
    let fileUrl = null;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID is required'
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

    // Handle file upload if present
    if (req.file) {
      try {
        fileUrl = await uploadFile(req.file);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'File upload failed'
        });
      }
    }

    // Validate content based on message type
    if (messageType === 'text' && !content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required for text messages'
      });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: fileUrl || content,
      messageType,
      fileUrl: fileUrl || null
    });

    // Populate sender details
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar');

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending message'
    });
  }
};

// Get conversation between two users
export const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Validate user existence
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get messages between users
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id }
      ],
      deletedFor: { $ne: req.user._id }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'username avatar')
    .populate('receiver', 'username avatar')
    .populate({
      path: 'replyTo',
      populate: {
        path: 'sender',
        select: 'username avatar'
      }
    });

    // Get total count for pagination
    const totalMessages = await Message.countDocuments({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ],
      deletedFor: { $ne: req.user._id }
    });

    // Mark messages as delivered
    const undeliveredMessages = messages.filter(
      msg => msg.sender.toString() === userId && !msg.deliveredTo.includes(req.user._id)
    );

    await Promise.all(
      undeliveredMessages.map(msg => msg.markAsDelivered(req.user._id))
    );

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasMore: totalMessages > skip + limit
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching conversation'
    });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is sender or receiver
    if (message.sender.toString() !== req.user.id && 
        message.receiver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    // Delete the message from database
    await Message.findByIdAndDelete(messageId);

    // Emit socket event for real-time update
    if (req.io) {
      req.io.to(message.sender.toString()).emit('message:deleted', {
        messageId,
        deletedBy: req.user.id
      });
      req.io.to(message.receiver.toString()).emit('message:deleted', {
        messageId,
        deletedBy: req.user.id
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted permanently'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting message'
    });
  }
};

// Mark message as read
export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the receiver
    if (message.receiver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this message as read'
      });
    }

    await message.markAsRead(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get unread messages count
export const getUnreadMessages = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user.id,
      'readBy.user': { $ne: req.user.id },
      deletedFor: { $ne: req.user.id }
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Edit message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender can edit message
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this message'
      });
    }

    await message.edit(content, req.user.id);

    // const populatedMessage = await Message.findById(newMessage._id)
    //   .populate('sender', 'username avatar')
    //   .populate('receiver', 'username avatar');

    const updatedMessage = await Message.findById(messageId)
      .populate('sender receiver', 'username avatar')
      .populate('editHistory.editedBy', 'username avatar');

    res.status(200).json({
      success: true,
      message: updatedMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add reaction to message
export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reaction } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.addReaction(req.user.id, reaction);

    const updatedMessage = await Message.findById(messageId)
      .populate('sender receiver', 'username avatar')
      .populate('reactions.user', 'username avatar');

    res.status(200).json({
      success: true,
      message: updatedMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove reaction from message
export const removeReaction = async (req, res) => {
  try {
    const { messageId, reactionType } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Remove the reaction
    const reactionIndex = message.reactions?.findIndex(r => 
      r.type === reactionType && r.users.includes(req.user.id)
    );

    if (reactionIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Reaction not found'
      });
    }

    // Remove user from the reaction's users array
    message.reactions[reactionIndex].users = message.reactions[reactionIndex].users
      .filter(userId => userId.toString() !== req.user.id);

    // If no users left for this reaction, remove the reaction entirely
    if (message.reactions[reactionIndex].users.length === 0) {
      message.reactions.splice(reactionIndex, 1);
    }

    await message.save();

    // Return updated message with populated fields
    const updatedMessage = await Message.findById(messageId)
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar');

    // Emit socket event if available
    if (req.io) {
      req.io.to(message.sender.toString()).to(message.receiver.toString()).emit('message:reaction', {
        messageId,
        updatedMessage
      });
    }

    res.status(200).json({
      success: true,
      message: updatedMessage
    });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error removing reaction'
    });
  }
};

// Reply to message
export const replyToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content, messageType = 'text' } = req.body;
    const senderId = req.user._id;
    let fileUrl = null;

    // Check if original message exists
    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      return res.status(404).json({
        success: false,
        message: 'Original message not found'
      });
    }

    // Handle file upload if present
    if (req.file) {
      try {
        fileUrl = await uploadFile(req.file);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'File upload failed'
        });
      }
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: originalMessage.sender,
      content: fileUrl || content,
      messageType,
      fileUrl: fileUrl || null,
      replyTo: messageId
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender receiver', 'username avatar')
      .populate('replyTo');

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark message as delivered
export const markMessageAsDelivered = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the receiver
    if (message.receiver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this message as delivered'
      });
    }

    await message.markAsDelivered(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Message marked as delivered'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete chat
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    // Convert string IDs to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const chatObjectId = new mongoose.Types.ObjectId(chatId);

    // Verify if the user is part of the chat
    const messages = await Message.find({
      $or: [
        { sender: userObjectId, receiver: chatObjectId },
        { sender: chatObjectId, receiver: userObjectId }
      ]
    });

    if (messages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or no messages exist'
      });
    }

    // Delete all messages between these users
    const deleteResult = await Message.deleteMany({
      $or: [
        { sender: userObjectId, receiver: chatObjectId },
        { sender: chatObjectId, receiver: userObjectId }
      ]
    });

    // Add socket event emission for real-time updates
    if (req.io) {
      req.io.to(chatId).emit('chat:deleted', {
        chatId,
        deletedBy: userId,
        permanent: true
      });
    }

    res.status(200).json({
      success: true,
      message: 'Chat deleted permanently',
      deletedCount: deleteResult.deletedCount
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting chat'
    });
  }
};

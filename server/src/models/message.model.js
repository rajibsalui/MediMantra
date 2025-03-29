import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    // required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'audio', 'video'],
    default: 'text'
  },
  fileUrl: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: null
  },
  mimeType: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'seen', 'failed'],
    default: 'sent'
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  deliveredTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveredAt: {
      type: Date,
      default: Date.now
    }
  }],
  deletedFor: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deletedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    },
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reaction: {
      type: String,
      enum: ['❤️', '👍', '👎', '😄', '😢', '😮'],
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Method to mark message as delivered
messageSchema.methods.markAsDelivered = async function(userId) {
  if (!this.deliveredTo.some(delivery => delivery.user.toString() === userId)) {
    this.deliveredTo.push({ user: userId });
    this.status = 'delivered';
    await this.save();
  }
  return this;
};

// Method to mark message as read
messageSchema.methods.markAsRead = async function(userId) {
  if (!this.readBy.some(read => read.user.toString() === userId)) {
    this.readBy.push({ user: userId });
    this.status = 'seen';
    await this.save();
  }
  return this;
};

// Method to soft delete message
messageSchema.methods.softDelete = async function(userId) {
  if (!this.deletedFor.some(del => del.user.toString() === userId)) {
    this.deletedFor.push({ user: userId });
    await this.save();
  }
  return this;
};

// Method to edit message
messageSchema.methods.edit = async function(newContent, userId) {
  this.editHistory.push({
    content: this.content,
    editedBy: userId,
  });
  this.content = newContent;
  this.isEdited = true;
  await this.save();
  return this;
};

// Method to add reaction
messageSchema.methods.addReaction = async function(userId, reaction) {
  const existingReaction = this.reactions.find(r => r.user.toString() === userId);
  if (existingReaction) {
    existingReaction.reaction = reaction;
  } else {
    this.reactions.push({ user: userId, reaction });
  }
  await this.save();
  return this;
};

// Method to remove reaction 
messageSchema.methods.removeReaction = async function(userId) {
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId);
  await this.save();
  return this;
};

// Add a method to check if message is deleted for a user
messageSchema.methods.isDeletedFor = function(userId) {
  return this.deletedFor.includes(userId);
};

// Add static method to delete chat
messageSchema.statics.deleteChat = async function(userId, chatId) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const chatObjectId = new mongoose.Types.ObjectId(chatId);

  return this.updateMany(
    {
      $or: [
        { sender: userObjectId, receiver: chatObjectId },
        { sender: chatObjectId, receiver: userObjectId }
      ]
    },
    {
      $addToSet: { deletedFor: userObjectId }
    }
  );
};

// Virtual for checking if message is read
messageSchema.virtual('isRead').get(function() {
  return this.status === 'seen';
});

// Virtual for checking if message is delivered
messageSchema.virtual('isDelivered').get(function() {
  return this.status === 'delivered' || this.status === 'seen';
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
/**
 * Chat Memory Module
 * Provides in-memory storage for chat conversations with 7-day TTL
 */

// Storage for chat conversations
const conversationStore = new Map();

// TTL for conversations (7 days in milliseconds)
const CONVERSATION_TTL = 7 * 24 * 60 * 60 * 1000; 

// Maximum number of exchanges to store per user (to prevent memory overflow)
const MAX_CONVERSATION_LENGTH = 20;

const chatMemory = {
  /**
   * Add a message exchange to a user's conversation
   * @param {string} userId - Unique identifier for the user
   * @param {Object} message - Message object with role and content
   */
  addExchange(userId, message) {
    if (!userId || !message) return;
    
    const conversation = this.getConversation(userId);
    
    // Add the new message
    conversation.push(message);
    
    // Trim conversation if exceeds maximum length
    if (conversation.length > MAX_CONVERSATION_LENGTH) {
      // Remove oldest messages but keep system messages if any
      const systemMessages = conversation.filter(msg => msg.role === 'system');
      const nonSystemMessages = conversation.filter(msg => msg.role !== 'system')
        .slice(-MAX_CONVERSATION_LENGTH + systemMessages.length);
      
      conversation.length = 0;
      conversation.push(...systemMessages, ...nonSystemMessages);
    }
    
    // Store updated conversation with new TTL
    conversationStore.set(userId, {
      messages: conversation,
      expiry: Date.now() + CONVERSATION_TTL
    });
  },
  
  /**
   * Get a user's conversation history
   * @param {string} userId - Unique identifier for the user
   * @returns {Array} - Array of message objects
   */
  getConversation(userId) {
    // Cleanup expired conversations first
    this.cleanupExpiredConversations();
    
    const conversation = conversationStore.get(userId);
    
    if (!conversation) {
      // Initialize new conversation if none exists
      conversationStore.set(userId, {
        messages: [],
        expiry: Date.now() + CONVERSATION_TTL
      });
      return [];
    }
    
    // Reset TTL on access
    conversation.expiry = Date.now() + CONVERSATION_TTL;
    
    return [...conversation.messages];
  },
  
  /**
   * Clear a user's conversation history
   * @param {string} userId - Unique identifier for the user
   */
  clearConversation(userId) {
    conversationStore.delete(userId);
  },
  
  /**
   * Remove all expired conversations
   */
  cleanupExpiredConversations() {
    const now = Date.now();
    
    for (const [userId, conversation] of conversationStore.entries()) {
      if (conversation.expiry < now) {
        conversationStore.delete(userId);
      }
    }
  },
  
  /**
   * Get the total number of active conversations
   * @returns {number} - Count of active conversations
   */
  getActiveConversationCount() {
    this.cleanupExpiredConversations();
    return conversationStore.size;
  }
};

// Set up periodic cleanup (every hour)
setInterval(() => {
  chatMemory.cleanupExpiredConversations();
}, 60 * 60 * 1000);

export default chatMemory;

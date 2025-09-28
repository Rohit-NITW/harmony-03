const { v4: uuidv4 } = require('uuid');

// In-memory conversation storage (for serverless, consider external storage)
const conversations = new Map();

// System prompt for MindWell AI - exactly matching Python version
const SYSTEM_PROMPT = {
  role: "system",
  content: `You are MindWell AI, a compassionate and knowledgeable mental health support assistant designed specifically for students. Your role is to:

1. PROVIDE EMOTIONAL SUPPORT: Listen actively and respond with empathy to students' mental health concerns
2. OFFER PRACTICAL GUIDANCE: Share evidence-based coping strategies, stress management techniques, and wellness tips
3. EDUCATE ABOUT MENTAL HEALTH: Provide information about common mental health conditions, symptoms, and when to seek help
4. PROMOTE HELP-SEEKING: Encourage students to reach out to professional support when needed
5. CRISIS AWARENESS: Recognize signs of crisis and provide appropriate resources

IMPORTANT GUIDELINES:
- Always be empathetic, non-judgmental, and supportive
- Never provide medical diagnoses or replace professional mental health care
- If someone expresses thoughts of self-harm or suicide, immediately provide crisis resources
- Focus on student-specific challenges: academic stress, social anxiety, homesickness, financial stress, etc.
- Promote healthy coping strategies and self-care practices
- Encourage connection with campus resources and professional support
- Use a warm, understanding tone while maintaining professional boundaries

CRISIS RESOURCES TO SHARE WHEN NEEDED:
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- Campus counseling services
- Emergency services: 911

Remember: You are a supportive companion in their mental health journey, not a replacement for professional care.`
};

/**
 * Conversation class to manage chat sessions
 */
class Conversation {
  constructor() {
    this.messages = [SYSTEM_PROMPT];
    this.active = true;
    this.createdAt = new Date();
    this.lastActivity = new Date();
  }

  /**
   * Add a message to the conversation
   * @param {string} role - 'user' or 'assistant'
   * @param {string} content - Message content
   */
  addMessage(role, content) {
    this.messages.push({
      role: role,
      content: content
    });
    this.lastActivity = new Date();
  }

  /**
   * Get all messages in the conversation
   * @returns {Array} Array of messages
   */
  getMessages() {
    return this.messages;
  }

  /**
   * Check if conversation is active
   * @returns {boolean} Active status
   */
  isActive() {
    return this.active;
  }

  /**
   * End the conversation
   */
  endConversation() {
    this.active = false;
  }

  /**
   * Clean old messages to prevent token limit issues
   * Keep system prompt + last 20 messages
   */
  cleanOldMessages() {
    if (this.messages.length > 21) { // System prompt + 20 messages
      const systemPrompt = this.messages[0];
      const recentMessages = this.messages.slice(-20);
      this.messages = [systemPrompt, ...recentMessages];
    }
  }
}

/**
 * Get or create a conversation by ID
 * @param {string} conversationId - Unique conversation identifier
 * @returns {Conversation} Conversation instance
 */
function getOrCreateConversation(conversationId) {
  if (!conversationId) {
    conversationId = uuidv4();
  }

  if (!conversations.has(conversationId)) {
    conversations.set(conversationId, new Conversation());
  }

  return {
    conversation: conversations.get(conversationId),
    conversationId: conversationId
  };
}

/**
 * Delete a conversation
 * @param {string} conversationId - Conversation ID to delete
 */
function deleteConversation(conversationId) {
  return conversations.delete(conversationId);
}

/**
 * Clean up old conversations (older than 24 hours)
 */
function cleanupOldConversations() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

  for (const [id, conversation] of conversations.entries()) {
    if (conversation.lastActivity < cutoff) {
      conversations.delete(id);
    }
  }
}

/**
 * Get conversation statistics
 * @returns {Object} Statistics about active conversations
 */
function getConversationStats() {
  return {
    totalConversations: conversations.size,
    activeConversations: Array.from(conversations.values()).filter(c => c.active).length,
    lastCleanup: new Date()
  };
}

// Periodic cleanup (run every hour in production)
if (process.env.NODE_ENV === 'production') {
  setInterval(cleanupOldConversations, 60 * 60 * 1000);
}

module.exports = {
  Conversation,
  getOrCreateConversation,
  deleteConversation,
  cleanupOldConversations,
  getConversationStats,
  SYSTEM_PROMPT
};
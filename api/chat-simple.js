/**
 * Simple chat handler without CORS (for testing)
 */

const { queryGroqAPI } = require('../lib/groq-client');
const { getOrCreateConversation } = require('../lib/conversation');
const { analyzeCrisisLevel } = require('../lib/crisis-detection');

function validateRequest(body) {
  const errors = [];
  
  if (!body.message || typeof body.message !== 'string' || body.message.trim().length === 0) {
    errors.push('Message is required and must be a non-empty string');
  }
  
  if (body.message && body.message.length > 2000) {
    errors.push('Message must be less than 2000 characters');
  }
  
  if (!body.conversation_id || typeof body.conversation_id !== 'string') {
    errors.push('conversation_id is required and must be a string');
  }
  
  if (body.role && !['user', 'system'].includes(body.role)) {
    errors.push('role must be either "user" or "system"');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

async function simpleChatHandler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    // Parse and validate request body
    const { message, role = 'user', conversation_id } = req.body;
    
    const validation = validateRequest({ message, role, conversation_id });
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Invalid request',
        details: validation.errors
      });
    }

    // Get or create conversation
    const { conversation, conversationId } = getOrCreateConversation(conversation_id);

    // Check if conversation is still active
    if (!conversation.isActive()) {
      return res.status(400).json({
        error: 'Conversation ended',
        message: 'The chat session has ended. Please start a new session.'
      });
    }

    // Process the user's message
    let processedMessage = message.trim();

    // Check for crisis indicators
    const crisisAnalysis = analyzeCrisisLevel(processedMessage);
    if (crisisAnalysis.isCrisis) {
      // Append crisis context to message
      processedMessage += crisisAnalysis.context;
      
      // Log crisis detection for monitoring
      console.log(`[CRISIS DETECTED] Conversation: ${conversationId}, Severity: ${crisisAnalysis.severity}`);
    }

    // Add user message to conversation
    conversation.addMessage(role, processedMessage);

    // Clean old messages if conversation is getting too long
    conversation.cleanOldMessages();

    // Get AI response from Groq
    const aiResponse = await queryGroqAPI(conversation.getMessages());

    // Add AI response to conversation
    conversation.addMessage('assistant', aiResponse);

    // Return response
    return res.status(200).json({
      response: aiResponse,
      conversation_id: conversationId,
      // Include crisis info if detected
      ...(crisisAnalysis.isCrisis && {
        crisis_detected: true,
        crisis_severity: crisisAnalysis.severity
      })
    });

  } catch (error) {
    console.error('Chat API error:', error);

    // Return appropriate error response
    if (error.message.includes('Groq API')) {
      return res.status(503).json({
        error: 'AI service temporarily unavailable',
        message: 'Please try again in a moment'
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again.',
      debug: error.message
    });
  }
}

module.exports = simpleChatHandler;
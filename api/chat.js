/**
 * MindWell AI Chat API - Serverless Function
 * Direct JavaScript conversion of the Python FastAPI chatbot
 */

const cors = require('cors');
const { queryGroqAPI } = require('../lib/groq-client');
const { getOrCreateConversation } = require('../lib/conversation');
const { analyzeCrisisLevel } = require('../lib/crisis-detection');

// CORS configuration - more permissive for development
const corsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware wrapper for CORS
function runCors(req, res) {
  return new Promise((resolve, reject) => {
    // Add a callback function to handle completion
    const corsMiddleware = cors(corsOptions);
    corsMiddleware(req, res, (error) => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
}

/**
 * Validate request body
 * @param {Object} body - Request body
 * @returns {Object} - Validation result
 */
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

/**
 * Main chat handler function
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function chatHandler(req, res) {
  // Set CORS headers manually
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

    // Get or create conversation (matching Python logic)
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

    // Check for crisis indicators (matching Python logic)
    const crisisAnalysis = analyzeCrisisLevel(processedMessage);
    if (crisisAnalysis.isCrisis) {
      // Append crisis context to message (exactly like Python version)
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

    // Return response (matching Python FastAPI format)
    return res.status(200).json({
      response: aiResponse,
      conversation_id: conversationId,
      // Include crisis info if detected (for frontend handling)
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
      message: 'An unexpected error occurred. Please try again.'
    });
  }
}

// Export the handler function for Vercel
module.exports = chatHandler;
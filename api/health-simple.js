/**
 * Simple health check without CORS (for testing)
 */

const { getConversationStats } = require('../lib/conversation');

async function simpleHealthHandler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts GET requests'
    });
  }

  try {
    // Get conversation statistics
    const stats = getConversationStats();
    
    // Check if Groq API key is available
    const hasGroqKey = !!process.env.GROQ_API_KEY;
    
    // Return health status
    return res.status(200).json({
      status: 'healthy',
      service: 'MindWell AI Chatbot',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      dependencies: {
        groq_api: hasGroqKey ? 'configured' : 'missing',
        conversations: stats
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    return res.status(500).json({
      status: 'unhealthy',
      service: 'MindWell AI Chatbot',
      timestamp: new Date().toISOString(),
      error: error.message || 'Health check failed'
    });
  }
}

module.exports = simpleHealthHandler;
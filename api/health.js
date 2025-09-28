/**
 * Health Check API - Serverless Function
 * Matches the Python FastAPI health endpoint
 */

const cors = require('cors');
const { getConversationStats } = require('../lib/conversation');

// CORS configuration - more permissive for development
const corsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'OPTIONS'],
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
 * Health check handler function
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function healthHandler(req, res) {
// Set CORS headers manually
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
    
    // Return health status (matching Python version)
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
      error: 'Health check failed'
    });
  }
}

// Export the handler function for Vercel
module.exports = healthHandler;
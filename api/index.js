/**
 * Root API Endpoint - Serverless Function
 * Matches the Python FastAPI root endpoint
 */

const cors = require('cors');

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      'http://localhost:3000',
      'http://localhost:5173',
      'https://localhost:3000'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware wrapper for CORS
function runCors(req, res) {
  return new Promise((resolve, reject) => {
    cors(corsOptions)(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

/**
 * Root API handler function
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function rootHandler(req, res) {
  // Handle CORS
  try {
    await runCors(req, res);
  } catch (error) {
    return res.status(403).json({ error: 'CORS error', details: error.message });
  }

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
    // Return API information (matching Python version)
    return res.status(200).json({
      message: "Welcome to MindWell AI Chatbot API",
      version: "1.0.0",
      description: "Mental health support chatbot for students",
      endpoints: {
        chat: "/api/chat - POST - Main chat endpoint",
        health: "/api/health - GET - Health check endpoint"
      },
      documentation: "https://your-docs-url.com",
      support: "support@mindwell-ai.com"
    });

  } catch (error) {
    console.error('Root API error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'API information could not be retrieved'
    });
  }
}

// Export the handler function for Vercel
module.exports = rootHandler;
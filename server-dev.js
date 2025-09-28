/**
 * Development server for testing MindWell AI Chatbot API locally
 * Run with: node server-dev.js
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Import API handlers
const chatHandler = require('./api/chat');
const healthHandler = require('./api/health');
const rootHandler = require('./api/index');

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for development
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route handlers - wrap Vercel functions for Express
app.post('/api/chat', (req, res) => chatHandler(req, res));
app.get('/api/health', (req, res) => healthHandler(req, res));
app.get('/api', (req, res) => rootHandler(req, res));
app.get('/api/', (req, res) => rootHandler(req, res));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: "🤖 MindWell AI Chatbot - Development Server",
    status: "running",
    endpoints: {
      "API Root": "GET /api/",
      "Health Check": "GET /api/health",
      "Chat": "POST /api/chat"
    },
    time: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 MindWell AI Chatbot Development Server');
  console.log('==========================================');
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log('');
  console.log('📡 API Endpoints:');
  console.log(`   GET  http://localhost:${PORT}/api/`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   POST http://localhost:${PORT}/api/chat`);
  console.log('');
  console.log('🧪 Test Commands:');
  console.log(`   curl http://localhost:${PORT}/api/health`);
  console.log(`   curl -X POST http://localhost:${PORT}/api/chat -H "Content-Type: application/json" -d "{\\"message\\": \\"Hello\\", \\"conversation_id\\": \\"test-123\\"}"`);
  console.log('');
  console.log('⚠️  Note: Set GROQ_API_KEY in .env file to test chat functionality');
  console.log('');
  console.log('🛑 Press Ctrl+C to stop the server');
});

module.exports = app;
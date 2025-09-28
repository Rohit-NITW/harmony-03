/**
 * Simple Express server for local development
 * This runs your API endpoints locally for testing
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// API Routes
const chatHandler = require('./api/chat');
const healthHandler = require('./api/health');
const indexHandler = require('./api/index');

// Mount API routes
app.post('/api/chat', chatHandler);
app.get('/api/health', healthHandler);
app.get('/api', indexHandler);

// Serve static files (for production build)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   - Health: http://localhost:${PORT}/api/health`);
  console.log(`   - Chat: http://localhost:${PORT}/api/chat`);
  console.log(`   - Root: http://localhost:${PORT}/api`);
  console.log(`\n🤖 Groq API Key: ${process.env.GROQ_API_KEY ? '✅ Set' : '❌ Missing'}`);
});

module.exports = app;
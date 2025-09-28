/**
 * Direct test of API endpoints without HTTP server
 * This tests the chatbot functionality directly
 */

require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

// Import API handlers
const chatHandler = require('./api/chat');
const healthHandler = require('./api/health');

// Mock request and response objects
function createMockRequest(method, body = {}, headers = {}) {
  return {
    method: method,
    body: body,
    headers: {
      'content-type': 'application/json',
      ...headers
    }
  };
}

function createMockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.body = data;
      return this;
    },
    end: function() {
      return this;
    },
    setHeader: function(name, value) {
      this.headers[name] = value;
      return this;
    }
  };
}

async function testHealthEndpoint() {
  console.log('🏥 Testing Health Endpoint...');
  
  const req = createMockRequest('GET');
  const res = createMockResponse();
  
  await healthHandler(req, res);
  
  console.log(`Status: ${res.statusCode}`);
  console.log(`Response:`, JSON.stringify(res.body, null, 2));
  return res.statusCode === 200;
}

async function testChatEndpoint() {
  console.log('\n💬 Testing Chat Endpoint...');
  
  const conversationId = uuidv4();
  const req = createMockRequest('POST', {
    message: "Hello! I'm feeling a bit stressed about work.",
    conversation_id: conversationId,
    role: "user"
  });
  const res = createMockResponse();
  
  await chatHandler(req, res);
  
  console.log(`Status: ${res.statusCode}`);
  console.log(`Response:`, JSON.stringify(res.body, null, 2));
  
  return res.statusCode === 200 && res.body && res.body.response;
}

async function runTests() {
  console.log('🚀 Testing Chatbot API Functions Directly');
  console.log('==========================================');
  
  // Check environment
  if (!process.env.GROQ_API_KEY) {
    console.log('❌ GROQ_API_KEY not found in .env file');
    return;
  }
  
  console.log('✅ GROQ_API_KEY found');
  console.log(`Key starts with: ${process.env.GROQ_API_KEY.substring(0, 8)}...`);
  
  try {
    // Test health endpoint
    const healthPassed = await testHealthEndpoint();
    
    if (healthPassed) {
      console.log('✅ Health endpoint working');
      
      // Test chat endpoint
      const chatPassed = await testChatEndpoint();
      
      if (chatPassed) {
        console.log('✅ Chat endpoint working');
        console.log('\n🎉 All tests passed! Your chatbot is ready!');
        console.log('\nNext steps:');
        console.log('1. Deploy to Vercel: vercel --prod');
        console.log('2. Or test locally: Start your frontend (npm run dev)');
      } else {
        console.log('❌ Chat endpoint failed');
      }
    } else {
      console.log('❌ Health endpoint failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

runTests();
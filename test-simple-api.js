/**
 * Test the simplified API handlers (without CORS)
 */

require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

// Import simplified handlers
const simpleHealthHandler = require('./api/health-simple');
const simpleChatHandler = require('./api/chat-simple');

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
      console.log(`Response [${this.statusCode}]:`, JSON.stringify(data, null, 2));
      return this;
    },
    end: function() {
      console.log(`Response [${this.statusCode}]: (empty)`);
      return this;
    },
    setHeader: function(name, value) {
      this.headers[name] = value;
      return this;
    }
  };
}

async function testSimpleHealth() {
  console.log('🏥 Testing Simple Health Endpoint...');
  
  const req = {
    method: 'GET',
    body: {},
    headers: { 'content-type': 'application/json' }
  };
  const res = createMockResponse();
  
  try {
    await simpleHealthHandler(req, res);
    return res.statusCode === 200;
  } catch (error) {
    console.error('Health test failed:', error);
    return false;
  }
}

async function testSimpleChat() {
  console.log('\n💬 Testing Simple Chat Endpoint...');
  
  const conversationId = uuidv4();
  const req = {
    method: 'POST',
    body: {
      message: "Hello! I'm feeling stressed about my exams. Can you help?",
      conversation_id: conversationId,
      role: "user"
    },
    headers: { 'content-type': 'application/json' }
  };
  const res = createMockResponse();
  
  try {
    await simpleChatHandler(req, res);
    return res.statusCode === 200 && res.body && res.body.response;
  } catch (error) {
    console.error('Chat test failed:', error);
    return false;
  }
}

async function runSimpleTests() {
  console.log('🧪 Testing Simplified API Handlers');
  console.log('===================================');
  
  if (!process.env.GROQ_API_KEY) {
    console.log('❌ GROQ_API_KEY not found');
    return;
  }
  
  console.log('✅ GROQ_API_KEY found');
  
  try {
    const healthPassed = await testSimpleHealth();
    
    if (healthPassed) {
      console.log('✅ Simple health endpoint working');
      
      const chatPassed = await testSimpleChat();
      
      if (chatPassed) {
        console.log('✅ Simple chat endpoint working');
        console.log('\n🎉 API core functionality is working!');
        console.log('\nIssue is likely with CORS middleware in the original handlers.');
      } else {
        console.log('❌ Simple chat endpoint failed');
      }
    } else {
      console.log('❌ Simple health endpoint failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

runSimpleTests();
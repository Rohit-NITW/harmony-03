/**
 * Test the fixed original API handlers
 */

require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

// Import original handlers
const healthHandler = require('./api/health');
const chatHandler = require('./api/chat');

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

async function testFixedHealth() {
  console.log('🏥 Testing Fixed Health Endpoint...');
  
  const req = {
    method: 'GET',
    body: {},
    headers: { 'content-type': 'application/json' }
  };
  const res = createMockResponse();
  
  try {
    await healthHandler(req, res);
    return res.statusCode === 200;
  } catch (error) {
    console.error('Health test failed:', error.message);
    return false;
  }
}

async function testFixedChat() {
  console.log('\n💬 Testing Fixed Chat Endpoint...');
  
  const conversationId = uuidv4();
  const req = {
    method: 'POST',
    body: {
      message: "Hello! I need help with anxiety.",
      conversation_id: conversationId,
      role: "user"
    },
    headers: { 'content-type': 'application/json' }
  };
  const res = createMockResponse();
  
  try {
    await chatHandler(req, res);
    return res.statusCode === 200 && res.body && res.body.response;
  } catch (error) {
    console.error('Chat test failed:', error.message);
    return false;
  }
}

async function runFixedTests() {
  console.log('🔧 Testing Fixed Original API Handlers');
  console.log('=======================================');
  
  if (!process.env.GROQ_API_KEY) {
    console.log('❌ GROQ_API_KEY not found');
    return;
  }
  
  console.log('✅ GROQ_API_KEY found');
  
  try {
    const healthPassed = await testFixedHealth();
    
    if (healthPassed) {
      console.log('✅ Fixed health endpoint working');
      
      const chatPassed = await testFixedChat();
      
      if (chatPassed) {
        console.log('✅ Fixed chat endpoint working');
        console.log('\n🎉 ORIGINAL API HANDLERS ARE NOW WORKING!');
        console.log('\n✨ Your chatbot should now work properly in the frontend!');
      } else {
        console.log('❌ Fixed chat endpoint failed');
      }
    } else {
      console.log('❌ Fixed health endpoint failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

runFixedTests();
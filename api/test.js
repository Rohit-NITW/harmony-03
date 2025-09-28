/**
 * Test script for MindWell AI Chatbot API
 * Run with: node api/test.js
 */

const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Mock request/response objects for local testing
function createMockRequest(method, body = {}) {
  return {
    method: method,
    body: body,
    headers: {
      'content-type': 'application/json'
    }
  };
}

function createMockResponse() {
  const res = {
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
  return res;
}

async function testHealthEndpoint() {
  console.log('\n=== Testing Health Endpoint ===');
  
  const healthHandler = require('./health');
  const req = createMockRequest('GET');
  const res = createMockResponse();
  
  await healthHandler(req, res);
}

async function testRootEndpoint() {
  console.log('\n=== Testing Root Endpoint ===');
  
  const rootHandler = require('./index');
  const req = createMockRequest('GET');
  const res = createMockResponse();
  
  await rootHandler(req, res);
}

async function testChatEndpoint() {
  console.log('\n=== Testing Chat Endpoint ===');
  
  if (!process.env.GROQ_API_KEY) {
    console.log('⚠️  GROQ_API_KEY not found. Skipping chat test.');
    console.log('   Set your GROQ_API_KEY in .env file to test chat functionality.');
    return;
  }
  
  const chatHandler = require('./chat');
  const conversationId = uuidv4();
  
  // Test normal message
  console.log('\n--- Test 1: Normal Message ---');
  const req1 = createMockRequest('POST', {
    message: "Hi, I'm feeling stressed about my exams",
    conversation_id: conversationId,
    role: "user"
  });
  const res1 = createMockResponse();
  
  await chatHandler(req1, res1);
  
  // Test crisis message
  console.log('\n--- Test 2: Crisis Detection ---');
  const req2 = createMockRequest('POST', {
    message: "I feel hopeless and don't want to live anymore",
    conversation_id: conversationId,
    role: "user"
  });
  const res2 = createMockResponse();
  
  await chatHandler(req2, res2);
}

async function testInvalidRequests() {
  console.log('\n=== Testing Invalid Requests ===');
  
  const chatHandler = require('./chat');
  
  // Test missing message
  console.log('\n--- Test: Missing Message ---');
  const req1 = createMockRequest('POST', {
    conversation_id: uuidv4()
  });
  const res1 = createMockResponse();
  
  await chatHandler(req1, res1);
  
  // Test missing conversation_id
  console.log('\n--- Test: Missing Conversation ID ---');
  const req2 = createMockRequest('POST', {
    message: "Hello"
  });
  const res2 = createMockResponse();
  
  await chatHandler(req2, res2);
  
  // Test invalid method
  console.log('\n--- Test: Invalid Method ---');
  const req3 = createMockRequest('GET', {});
  const res3 = createMockResponse();
  
  await chatHandler(req3, res3);
}

async function runAllTests() {
  console.log('🤖 MindWell AI Chatbot API Tests');
  console.log('================================');
  
  try {
    await testRootEndpoint();
    await testHealthEndpoint();
    await testChatEndpoint();
    await testInvalidRequests();
    
    console.log('\n✅ All tests completed!');
    console.log('\nNext steps:');
    console.log('1. Set GROQ_API_KEY in .env file');
    console.log('2. Run: npm run vercel:dev (for local Vercel development)');
    console.log('3. Deploy: npm run vercel:deploy');
    
  } catch (error) {
    console.error('\n❌ Test error:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}
/**
 * Test core chatbot functionality directly
 * This bypasses HTTP and CORS to test the actual chatbot logic
 */

require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

// Import core modules directly
const { queryGroqAPI } = require('./lib/groq-client');
const { getOrCreateConversation } = require('./lib/conversation');
const { analyzeCrisisLevel } = require('./lib/crisis-detection');

async function testGroqConnection() {
  console.log('🔌 Testing Groq API Connection...');
  
  if (!process.env.GROQ_API_KEY) {
    console.log('❌ GROQ_API_KEY not found');
    return false;
  }
  
  try {
    const messages = [
      {
        role: 'system',
        content: 'You are MindWell AI, a compassionate mental health support chatbot.'
      },
      {
        role: 'user',
        content: 'Hello, can you help me?'
      }
    ];
    
    const response = await queryGroqAPI(messages);
    console.log('✅ Groq API connected successfully');
    console.log('Sample response:', response.substring(0, 100) + '...');
    return true;
    
  } catch (error) {
    console.log('❌ Groq API connection failed:', error.message);
    return false;
  }
}

async function testConversationFlow() {
  console.log('\n💬 Testing Conversation Flow...');
  
  const conversationId = uuidv4();
  
  try {
    // Test 1: Create conversation
    const { conversation } = getOrCreateConversation(conversationId);
    console.log('✅ Conversation created');
    
    // Test 2: Add user message
    const userMessage = "Hi, I'm feeling anxious about my job interview tomorrow.";
    conversation.addMessage('user', userMessage);
    console.log('✅ User message added');
    
    // Test 3: Crisis detection
    const crisisAnalysis = analyzeCrisisLevel(userMessage);
    console.log('✅ Crisis analysis completed:', crisisAnalysis.isCrisis ? 'Crisis detected' : 'No crisis');
    
    // Test 4: Generate AI response
    const messages = conversation.getMessages();
    const aiResponse = await queryGroqAPI(messages);
    console.log('✅ AI response generated');
    console.log('AI Response:', aiResponse);
    
    // Test 5: Add AI response to conversation
    conversation.addMessage('assistant', aiResponse);
    console.log('✅ AI response added to conversation');
    
    return true;
    
  } catch (error) {
    console.log('❌ Conversation flow failed:', error.message);
    return false;
  }
}

async function testCrisisDetection() {
  console.log('\n🚨 Testing Crisis Detection...');
  
  const normalMessage = "I'm feeling a bit stressed about work";
  const crisisMessage = "I don't want to live anymore and feel hopeless";
  
  const normalAnalysis = analyzeCrisisLevel(normalMessage);
  const crisisAnalysis = analyzeCrisisLevel(crisisMessage);
  
  console.log('Normal message analysis:', normalAnalysis);
  console.log('Crisis message analysis:', crisisAnalysis);
  
  const normalCorrect = !normalAnalysis.isCrisis;
  const crisisCorrect = crisisAnalysis.isCrisis;
  
  if (normalCorrect && crisisCorrect) {
    console.log('✅ Crisis detection working correctly');
    return true;
  } else {
    console.log('❌ Crisis detection not working properly');
    return false;
  }
}

async function runAllTests() {
  console.log('🤖 Testing MindWell AI Chatbot Core Functionality');
  console.log('==================================================');
  
  const results = {
    groq: false,
    conversation: false,
    crisis: false
  };
  
  // Test Groq connection
  results.groq = await testGroqConnection();
  
  // Test conversation flow (only if Groq is working)
  if (results.groq) {
    results.conversation = await testConversationFlow();
  }
  
  // Test crisis detection
  results.crisis = await testCrisisDetection();
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log(`Groq API: ${results.groq ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Conversation Flow: ${results.conversation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Crisis Detection: ${results.crisis ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = results.groq && results.conversation && results.crisis;
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! Your chatbot is fully functional!');
    console.log('\nYour chatbot can:');
    console.log('• Connect to Groq AI and generate responses');
    console.log('• Manage conversation history');
    console.log('• Detect crisis situations');
    console.log('• Provide mental health support');
    console.log('\n✨ Ready for deployment to Vercel!');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
  }
}

runAllTests();
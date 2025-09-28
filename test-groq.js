/**
 * Simple test to verify Groq API integration
 * Run with: node test-groq.js
 */

require('dotenv').config();
const { queryGroqAPI } = require('./lib/groq-client');

async function testGroqAPI() {
  console.log('🤖 Testing Groq API Integration');
  console.log('===============================');
  
  // Check if API key is set
  if (!process.env.GROQ_API_KEY) {
    console.log('❌ GROQ_API_KEY not found in environment variables');
    console.log('   Make sure your .env file contains the API key');
    return;
  }
  
  console.log('✅ API Key found');
  console.log(`   Key starts with: ${process.env.GROQ_API_KEY.substring(0, 8)}...`);
  
  // Test API call
  console.log('\n📝 Testing API call...');
  
  try {
    const messages = [
      {
        role: 'system',
        content: 'You are MindWell AI, a compassionate mental health support chatbot. Respond with empathy and provide helpful guidance.'
      },
      {
        role: 'user',
        content: 'Hi, I\'m feeling stressed about my upcoming exams. Can you help me?'
      }
    ];
    
    const response = await queryGroqAPI(messages);
    
    console.log('✅ API call successful!');
    console.log('\n🤖 AI Response:');
    console.log('================');
    console.log(response);
    console.log('\n✅ Chatbot is functional and ready to use!');
    
  } catch (error) {
    console.log('❌ API call failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your API key is valid');
    console.log('2. Ensure you have internet connection');
    console.log('3. Verify Groq API is accessible');
  }
}

// Run test
testGroqAPI();
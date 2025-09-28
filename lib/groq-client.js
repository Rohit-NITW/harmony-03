const Groq = require('groq-sdk');

// Initialize Groq client
let groqClient = null;

function initGroqClient() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is required');
    }
    
    groqClient = new Groq({
      apiKey: apiKey
    });
  }
  
  return groqClient;
}

/**
 * Query Groq API with conversation messages
 * @param {Array} messages - Array of conversation messages
 * @returns {Promise<string>} - AI response
 */
async function queryGroqAPI(messages) {
  try {
    const client = initGroqClient();
    
    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: messages,
      temperature: 0.7, // Slightly lower temperature for more consistent, empathetic responses
      max_tokens: 1024,
      top_p: 1,
      stream: false, // Disable streaming for serverless functions
      stop: null,
    });
    
    return completion.choices[0].message.content || '';
    
  } catch (error) {
    console.error('Error with Groq API:', error);
    throw new Error(`Groq API error: ${error.message}`);
  }
}

/**
 * Stream response from Groq API (for future streaming implementation)
 * @param {Array} messages - Array of conversation messages
 * @returns {Promise<string>} - Complete streamed response
 */
async function queryGroqAPIStream(messages) {
  try {
    const client = initGroqClient();
    
    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: true,
      stop: null,
    });
    
    let response = '';
    for await (const chunk of completion) {
      response += chunk.choices[0]?.delta?.content || '';
    }
    
    return response;
    
  } catch (error) {
    console.error('Error with Groq API streaming:', error);
    throw new Error(`Groq API streaming error: ${error.message}`);
  }
}

module.exports = {
  queryGroqAPI,
  queryGroqAPIStream,
  initGroqClient
};
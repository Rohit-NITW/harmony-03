# 🚀 MindWell AI Chatbot - Vercel Deployment Guide

This guide will help you deploy your converted JavaScript chatbot to Vercel with the same functionality as your Python FastAPI version.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Groq API Key**: Get your key from [console.groq.com](https://console.groq.com)
3. **Node.js**: Version 18+ installed locally
4. **Git**: Your project in a Git repository

## 🛠 Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in your project root:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:
```env
GROQ_API_KEY=your_actual_groq_api_key_here
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### 3. Test Locally

```bash
# Test API functions
node api/test.js

# Run with Vercel dev server
npm run vercel:dev
```

Your API will be available at:
- Root: http://localhost:3000/api
- Health: http://localhost:3000/api/health  
- Chat: http://localhost:3000/api/chat (POST)

## 🌐 Vercel Deployment

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   npm run vercel:deploy
   ```

### Option 2: Deploy via GitHub Integration

1. Push your code to GitHub
2. Visit [vercel.com/dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables (see below)
6. Deploy!

## 🔧 Environment Variables Configuration

In your Vercel dashboard, add these environment variables:

| Variable | Value | Description |
|----------|--------|-------------|
| `GROQ_API_KEY` | `gsk_...` | Your Groq API key |
| `CORS_ORIGIN` | `https://yourdomain.com` | Your frontend URL |
| `NODE_ENV` | `production` | Environment setting |

### Setting Environment Variables:

1. Go to your project dashboard on Vercel
2. Click "Settings" tab
3. Click "Environment Variables"
4. Add each variable with the values above

## 📡 API Endpoints

After deployment, your API endpoints will be:

```
https://your-app.vercel.app/api/        # Root - API info
https://your-app.vercel.app/api/health  # Health check
https://your-app.vercel.app/api/chat    # Chat endpoint (POST)
```

## 🧪 Testing Your Deployment

### Test Health Endpoint
```bash
curl https://your-app.vercel.app/api/health
```

### Test Chat Endpoint
```bash
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hi, I need some mental health support",
    "conversation_id": "test-123"
  }'
```

## 🔄 Comparison: Python vs JavaScript

| Feature | Python FastAPI | JavaScript Vercel |
|---------|---------------|------------------|
| **Endpoints** | ✅ Same endpoints | ✅ Same endpoints |
| **Crisis Detection** | ✅ Keyword matching | ✅ Enhanced keyword + pattern matching |
| **Groq Integration** | ✅ llama-3.1-8b-instant | ✅ Same model and parameters |
| **CORS** | ✅ Basic CORS | ✅ Enhanced CORS with origin validation |
| **Error Handling** | ✅ HTTP exceptions | ✅ Detailed error responses |
| **Conversation Management** | ✅ In-memory storage | ✅ Enhanced with automatic cleanup |
| **Deployment** | 🐍 Requires Python runtime | 🚀 Serverless, auto-scaling |

## 🎯 Frontend Integration

Update your frontend to use the new API endpoints:

```javascript
// Before (Python FastAPI)
const API_BASE = 'http://localhost:8000';

// After (JavaScript Vercel)
const API_BASE = 'https://your-app.vercel.app/api';

// Chat function remains the same
async function sendMessage(message, conversationId) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message,
      conversation_id: conversationId,
      role: 'user'
    })
  });
  
  return await response.json();
}
```

## 🔍 Monitoring & Debugging

### View Logs
```bash
vercel logs your-app-name
```

### Monitor Performance
- Visit Vercel dashboard → Your project → "Analytics" tab
- Check response times and error rates
- Monitor serverless function usage

## 📊 Performance Optimizations

1. **Cold Start Reduction**: Vercel automatically handles this
2. **Memory Optimization**: Functions run with 256MB memory by default
3. **Response Caching**: Health endpoint responses are cached
4. **Conversation Cleanup**: Automatic cleanup prevents memory leaks

## 🚨 Crisis Support Features

Your deployed chatbot includes enhanced crisis detection:

- **Keyword Matching**: Same as Python version
- **Pattern Recognition**: Additional regex patterns
- **Severity Analysis**: High/moderate crisis levels
- **Immediate Resources**: Crisis hotlines and resources
- **Logging**: Crisis events are logged for monitoring

## 🔐 Security Features

- **CORS Protection**: Origin validation
- **Input Validation**: Request body validation
- **Rate Limiting**: Can be added via Vercel Edge Config
- **Environment Isolation**: Secure environment variable handling

## 🆘 Troubleshooting

### Common Issues:

**1. "GROQ_API_KEY not found"**
- Ensure environment variable is set in Vercel dashboard
- Check spelling and format of the API key

**2. "CORS error"**
- Update `CORS_ORIGIN` to match your frontend URL
- Include protocol (http/https) in the origin

**3. "Function timeout"**
- Groq API calls have 30-second timeout
- Check your internet connection and Groq API status

**4. "Module not found"**
- Ensure all dependencies are in `package.json`
- Run `npm install` before deploying

### Need Help?

1. Check Vercel function logs
2. Test endpoints with the provided test script
3. Verify environment variables are set correctly

## ✅ Success Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured
- [ ] Local testing passed (`node api/test.js`)
- [ ] Vercel deployment successful
- [ ] Health endpoint returns "healthy"
- [ ] Chat endpoint processes messages
- [ ] Crisis detection working
- [ ] Frontend integration updated
- [ ] CORS configured for your domain

Your MindWell AI chatbot is now successfully converted from Python to JavaScript and deployed on Vercel! 🎉
# 🤖 Global Chatbot Integration - Complete Guide

## 📋 Overview

The Harmony AI Chatbot is now fully integrated across your entire student experience! Students can access mental health support from any page in the application through a floating chat widget.

## 🎯 Key Features

### ✅ **Global Availability**
- **Floating chat button** appears on ALL student pages
- **Persistent across navigation** - chat history maintained between pages
- **Smart positioning** - automatically positions to avoid UI conflicts

### ✅ **Student-Only Experience**
- Only visible to authenticated students (not admins/mentors)
- Hidden from public/guest users
- Role-based access control

### ✅ **Mental Health Focused**
- Specialized AI assistant trained for student mental health
- Crisis detection and safety resources
- Evidence-based coping strategies
- Empathetic, professional responses

### ✅ **User Control**
- Toggle button in header navigation (desktop)
- Control panel in mobile menu
- Students can show/hide the chatbot anytime

## 📍 Where Students Will See It

### **Pages with Global Chatbot:**
- ✅ Student Dashboard (`/student/dashboard`)
- ✅ Assessment Page (`/assessment`) 
- ✅ Resources Page (`/resources`)
- ✅ Support Groups (`/groups`)
- ✅ Progress Tracking (`/progress`)
- ✅ Find Help (`/find-help`)
- ✅ Profile Page (`/profile`)

### **Pages WITHOUT Chatbot:**
- ❌ Public pages (Home, About)
- ❌ Admin dashboard
- ❌ Login/Auth pages
- ❌ Crisis page (has its own immediate resources)

## 🎛️ User Controls

### **Desktop Users:**
- **Floating Button**: Bottom-right corner on all student pages
- **Header Toggle**: Small 🤖 icon in the navigation bar
- **Click to toggle**: Show/hide the entire chatbot system

### **Mobile Users:**
- **Floating Button**: Same as desktop, optimized for touch
- **Mobile Menu**: Full control panel in hamburger menu
- **"AI Assistant On/Off"** toggle with clear labels

## 🔧 Technical Architecture

### **Frontend Components:**
```
src/contexts/ChatbotContext.tsx     - Global state management
src/components/FloatingChatbot.tsx  - Main chat interface
src/components/GlobalChatbot.tsx    - Global wrapper component
src/components/ChatbotControl.tsx   - Toggle controls
src/services/chatbotService.ts      - API communication
```

### **Integration Points:**
```
src/App.tsx                        - Provider setup & route wrapping
src/components/Layout.tsx           - Header controls
src/pages/dashboard/*.tsx           - Individual page integration
```

### **Backend:**
```
backend/mental_health_chatbot.py    - FastAPI server
backend/requirements.txt            - Dependencies
backend/setup_and_run.bat          - Auto-setup script
```

## 🚀 Setup & Running

### **1. Start the Backend Server**
```bash
cd backend
# Option A: Automated (Recommended)
./setup_and_run.bat

# Option B: Manual
pip install -r requirements.txt
python mental_health_chatbot.py
```

### **2. Configure API Key**
Edit `backend/.env`:
```
GROQ_API_KEY=your_groq_api_key_here
```
Get your free key from: https://console.groq.com/

### **3. Start Frontend**
```bash
npm start
# or
yarn start
```

### **4. Test the Integration**
1. Log in as a student
2. Navigate to any student page
3. Look for the floating 🤖 button (bottom-right)
4. Click to open/close chat
5. Send a message to test AI response

## 💬 Example Student Experience

### **First Time:**
1. Student logs into dashboard
2. Sees floating chat button with subtle animation
3. Clicks button → Chat window opens with welcome message
4. AI greets them personally: "Hello [Student Name]! I'm your Harmony AI assistant..."

### **Navigation:**
1. Student opens chat on Resources page
2. Starts conversation about stress management
3. Navigates to Progress page
4. Chat history is preserved
5. Can continue conversation seamlessly

### **Control:**
1. Student finds chat distracting during assessment
2. Clicks toggle in header → Chatbot disappears
3. Later clicks toggle again → Chatbot returns
4. Previous conversation is still available

## 🛡️ Safety Features

### **Crisis Detection:**
- Monitors for self-harm keywords
- Automatically provides crisis resources
- Escalates serious concerns appropriately
- Never replaces professional care

### **Privacy:**
- Conversations are session-based
- No permanent storage of chats
- Each session gets unique conversation ID
- CORS protection and API security

### **Professional Boundaries:**
- No medical diagnosis
- Encourages professional help
- Provides campus resources
- Clear limitations explained

## 🎨 Visual Design

### **Floating Button:**
- **Size**: 64x64px circular button
- **Colors**: Blue-to-purple gradient
- **Position**: Fixed bottom-right (24px margins)
- **Animation**: Smooth scale on hover/click
- **Icons**: Chat bubble (closed) / X (open)

### **Chat Window:**
- **Size**: 384px wide × 500px tall
- **Position**: Above floating button
- **Design**: Clean white with gradient header
- **Messages**: Rounded bubbles, user (right/blue), AI (left/white)
- **Responsive**: Adapts to mobile screens

### **Controls:**
- **Header Toggle**: Small circular button
- **Mobile Menu**: Full-width toggle with label
- **States**: Clear visual feedback (on/off)

## 🧪 Testing Scenarios

### **Basic Functionality:**
1. ✅ Chat opens/closes smoothly
2. ✅ Messages send and receive
3. ✅ Conversation history persists
4. ✅ Navigation doesn't break chat
5. ✅ Toggle controls work

### **Role-Based Access:**
1. ✅ Students see chatbot
2. ✅ Admins don't see chatbot
3. ✅ Logged-out users don't see chatbot
4. ✅ Only student pages show chatbot

### **Mental Health Responses:**
1. ✅ Empathetic responses to stress
2. ✅ Crisis keywords trigger resources
3. ✅ Professional boundaries maintained
4. ✅ Campus resources mentioned
5. ✅ Coping strategies offered

### **Error Handling:**
1. ✅ Backend offline → Clear error message
2. ✅ Network issues → Graceful fallback
3. ✅ API errors → User-friendly messages
4. ✅ Invalid responses → Error recovery

## 🚨 Troubleshooting

### **"Unable to connect to chatbot service"**
- Backend server not running (port 8000)
- GROQ API key missing/invalid
- Network/firewall blocking connection

### **Chatbot not visible**
- User not logged in as student
- Chatbot globally disabled via toggle
- Component not wrapped properly

### **Chat history lost**
- Backend server restarted
- Conversation ID reset
- Network disconnection

### **Poor AI responses**
- GROQ API issues
- System prompt not loaded
- Model overloaded

## 📊 Usage Analytics

Monitor these metrics:
- Chat sessions initiated
- Messages per conversation
- Crisis keywords detected
- User engagement rates
- Error rates and types

## 🔄 Future Enhancements

### **Potential Improvements:**
1. **Persistent Chat History** - Save conversations
2. **Voice Messages** - Audio input/output
3. **Sentiment Analysis** - Mood tracking
4. **Integration with Assessments** - Context-aware responses
5. **Multi-language Support** - Reach more students
6. **Therapist Escalation** - Direct professional referrals

---

## ✅ Ready to Launch!

Your Harmony AI Chatbot is now fully integrated and ready to provide 24/7 mental health support to your students across the entire platform. The global implementation ensures students always have access to help, no matter where they are in their digital wellness journey.

**Need support?** Check the backend README.md or contact your development team!
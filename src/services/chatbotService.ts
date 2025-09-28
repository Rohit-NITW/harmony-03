// Mental Health Chatbot Service
// This service handles the communication with the chatbot backend
// Make sure to start the Python backend server before using this

// Use relative paths - Vite proxy will handle routing in dev, Vercel handles in production
const CHATBOT_API_URL = ''

export interface ChatMessage {
  sender: 'user' | 'ai'
  text: string
  timestamp: Date
}

export interface ChatRequest {
  message: string
  conversation_id: string
  role?: string
}

export interface ChatResponse {
  response: string
  conversation_id: string
}

export class ChatbotService {
  private static instance: ChatbotService
  
  private constructor() {}
  
  static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService()
    }
    return ChatbotService.instance
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${CHATBOT_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: request.message,
          conversation_id: request.conversation_id,
          role: request.role || 'user'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Chatbot Service Error:', error)
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Unable to connect to the chatbot service. Please check if the backend server is running.')
        }
        throw error
      }
      
      throw new Error('An unexpected error occurred while communicating with the chatbot.')
    }
  }

  // Check if the backend service is available
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${CHATBOT_API_URL}/api/health`, {
        method: 'GET',
        timeout: 5000
      } as any)
      return response.ok
    } catch {
      return false
    }
  }

  // Generate a new conversation ID
  generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export const chatbotService = ChatbotService.getInstance()
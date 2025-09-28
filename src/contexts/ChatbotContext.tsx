import React, { createContext, useContext, useState, ReactNode } from 'react'

interface ChatbotContextType {
  isGlobalChatbotVisible: boolean
  showGlobalChatbot: () => void
  hideGlobalChatbot: () => void
  toggleGlobalChatbot: () => void
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined)

interface ChatbotProviderProps {
  children: ReactNode
}

export function ChatbotProvider({ children }: ChatbotProviderProps) {
  const [isGlobalChatbotVisible, setIsGlobalChatbotVisible] = useState(true)

  const showGlobalChatbot = () => setIsGlobalChatbotVisible(true)
  const hideGlobalChatbot = () => setIsGlobalChatbotVisible(false)
  const toggleGlobalChatbot = () => setIsGlobalChatbotVisible(prev => !prev)

  return (
    <ChatbotContext.Provider value={{
      isGlobalChatbotVisible,
      showGlobalChatbot,
      hideGlobalChatbot,
      toggleGlobalChatbot
    }}>
      {children}
    </ChatbotContext.Provider>
  )
}

export function useChatbot() {
  const context = useContext(ChatbotContext)
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider')
  }
  return context
}
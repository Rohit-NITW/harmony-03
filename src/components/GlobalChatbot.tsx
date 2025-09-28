import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useChatbot } from '../contexts/ChatbotContext'
import FloatingChatbot from './FloatingChatbot'

export default function GlobalChatbot() {
  const { userData, currentUser } = useAuth()
  const { isGlobalChatbotVisible } = useChatbot()

  // Only show chatbot for authenticated student users
  const shouldShowChatbot = () => {
    if (!currentUser || !userData) return false
    
    // Check if user is a student (not admin/mentor)
    const userRole = userData.role?.toLowerCase() || 'student'
    return userRole === 'student' || userRole === 'user'
  }

  // Don't render if user shouldn't see chatbot or if globally disabled
  if (!shouldShowChatbot() || !isGlobalChatbotVisible) {
    return null
  }

  return <FloatingChatbot />
}

// Higher-order component to wrap pages with global chatbot
export function withGlobalChatbot<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>
) {
  const WithGlobalChatbotComponent = (props: T) => {
    return (
      <>
        <WrappedComponent {...props} />
        <GlobalChatbot />
      </>
    )
  }

  WithGlobalChatbotComponent.displayName = `withGlobalChatbot(${WrappedComponent.displayName || WrappedComponent.name})`
  
  return WithGlobalChatbotComponent
}
import { useAuth } from '../contexts/AuthContext'
import { trackUserActivity, trackResourceRead } from '../services/firebase'

export const useActivityTracker = () => {
  const { currentUser } = useAuth()

  const trackActivity = async (activityType: string, details?: any) => {
    if (!currentUser?.uid) return
    
    try {
      await trackUserActivity(currentUser.uid, activityType, details)
    } catch (error) {
      console.error('Error tracking activity:', error)
    }
  }

  const trackAssessmentComplete = async (wellnessScore: number, riskLevel: string) => {
    await trackActivity('assessment', {
      assessmentType: 'wellness_check',
      wellnessScore,
      riskLevel
    })
  }

  const trackResourceRead = async (resourceId: string, resourceTitle: string) => {
    if (!currentUser?.uid) return
    
    try {
      await trackResourceRead(currentUser.uid, resourceId, resourceTitle)
    } catch (error) {
      console.error('Error tracking resource read:', error)
    }
  }

  const trackGroupJoin = async (groupId: string, groupName: string) => {
    await trackActivity('group_join', {
      groupId,
      groupName
    })
  }

  const trackLogin = async () => {
    await trackActivity('login', {
      timestamp: new Date().toISOString(),
      source: 'user_login'
    })
  }

  const trackPageVisit = async (pageName: string) => {
    await trackActivity('page_visit', {
      pageName,
      timestamp: new Date().toISOString()
    })
  }

  return {
    trackActivity,
    trackAssessmentComplete,
    trackResourceRead,
    trackGroupJoin,
    trackLogin,
    trackPageVisit
  }
}
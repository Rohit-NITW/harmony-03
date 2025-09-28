import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  writeBatch,
  increment
} from 'firebase/firestore'
import { db } from '../config/firebase'

// User Management
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...userData,
      updatedAt: serverTimestamp()
    })
    return { success: true }
  } catch (error) {
    console.error('Error creating user profile:', error)
    return { success: false, error }
  }
}

export const getUserProfile = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() }
    } else {
      return { success: false, error: 'User not found' }
    }
  } catch (error) {
    console.error('Error getting user profile:', error)
    return { success: false, error }
  }
}

export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return { success: true }
  } catch (error) {
    console.error('Error updating user profile:', error)
    return { success: false, error }
  }
}

// Assessment Management
export const saveAssessmentResult = async (userId: string, assessmentData: any) => {
  try {
    const assessmentRef = await addDoc(collection(db, 'assessments'), {
      userId,
      ...assessmentData,
      createdAt: serverTimestamp()
    })
    
    // Update user's latest assessment and wellness score
    const updateData: any = {
      latestAssessment: assessmentRef.id,
      latestAssessmentDate: serverTimestamp()
    }
    
    // Add wellness score if available
    if (assessmentData.wellnessScore !== undefined) {
      updateData.latestWellnessScore = assessmentData.wellnessScore
      updateData.lastWellnessUpdate = serverTimestamp()
    }
    
    await updateDoc(doc(db, 'users', userId), updateData)
    
    // Track assessment activity
    await trackUserActivity(userId, 'assessment', {
      assessmentType: assessmentData.type || 'wellness_check',
      wellnessScore: assessmentData.wellnessScore,
      riskLevel: assessmentData.recommendation?.level || 'unknown'
    })
    
    return { success: true, id: assessmentRef.id }
  } catch (error) {
    console.error('Error saving assessment result:', error)
    return { success: false, error }
  }
}

export const getUserAssessments = async (userId: string, limitCount: number = 10) => {
  try {
    const assessmentsRef = collection(db, 'assessments')
    const q = query(
      assessmentsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    const assessments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return { success: true, data: assessments }
  } catch (error) {
    console.error('Error getting user assessments:', error)
    return { success: false, error }
  }
}

// Get wellness scores for last 4 weeks for admin dashboard
export const getWellnessScoresLast4Weeks = async () => {
  try {
    // Calculate date 4 weeks ago
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
    
    const assessmentsRef = collection(db, 'assessments')
    // Use simple query to avoid index requirements
    const q = query(assessmentsRef)
    
    const querySnapshot = await getDocs(q)
    let assessments = querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        userId: data.userId,
        wellnessScore: data.wellnessScore,
        createdAt: data.createdAt,
        recommendation: data.recommendation,
        date: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
      }
    })
    
    // Filter and sort in JavaScript
    assessments = assessments
      .filter(assessment => {
        return assessment.wellnessScore != null && 
               assessment.date >= fourWeeksAgo
      })
      .sort((a, b) => {
        const aTime = a.date?.getTime ? a.date.getTime() : 0
        const bTime = b.date?.getTime ? b.date.getTime() : 0
        return bTime - aTime // descending order (newest first)
      })
    
    // Group by user and get latest assessment per user
    const userLatestScores = new Map()
    assessments.forEach(assessment => {
      if (!userLatestScores.has(assessment.userId) || 
          assessment.date > userLatestScores.get(assessment.userId).date) {
        userLatestScores.set(assessment.userId, assessment)
      }
    })
    
    return { 
      success: true, 
      data: {
        allAssessments: assessments,
        userLatestScores: Array.from(userLatestScores.values())
      }
    }
  } catch (error) {
    console.error('Error getting wellness scores for last 4 weeks:', error)
    return { success: false, error }
  }
}

// Get individual user's wellness score trend for last 4 weeks
export const getUserWellnessScoreTrend = async (userId: string) => {
  try {
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
    
    const assessmentsRef = collection(db, 'assessments')
    const q = query(
      assessmentsRef,
      where('userId', '==', userId)
    )
    
    const querySnapshot = await getDocs(q)
    let wellnessData = querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        wellnessScore: data.wellnessScore,
        date: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        riskLevel: data.recommendation?.level || 'Unknown',
        createdAt: data.createdAt
      }
    })
    
    // Filter and sort in JavaScript to avoid complex index requirements
    wellnessData = wellnessData
      .filter(item => {
        return item.wellnessScore != null && 
               item.date >= fourWeeksAgo
      })
      .sort((a, b) => {
        const aTime = a.date?.getTime ? a.date.getTime() : 0
        const bTime = b.date?.getTime ? b.date.getTime() : 0
        return aTime - bTime // ascending order
      })
    
    return { success: true, data: wellnessData }
  } catch (error) {
    console.error('Error getting user wellness score trend:', error)
    return { success: false, error }
  }
}

// Support Groups Management
export const createSupportGroup = async (groupData: any) => {
  try {
    const groupRef = await addDoc(collection(db, 'supportGroups'), {
      ...groupData,
      members: [],
      createdAt: serverTimestamp()
    })
    return { success: true, id: groupRef.id }
  } catch (error) {
    console.error('Error creating support group:', error)
    return { success: false, error }
  }
}

export const joinSupportGroup = async (groupId: string, userId: string) => {
  try {
    const groupRef = doc(db, 'supportGroups', groupId)
    const groupDoc = await getDoc(groupRef)
    
    if (groupDoc.exists()) {
      const groupData = groupDoc.data()
      const currentMembers = groupData.members || []
      if (!currentMembers.includes(userId)) {
        await updateDoc(groupRef, {
          members: [...currentMembers, userId],
          updatedAt: serverTimestamp()
        })
        
        // Track group join activity
        await trackUserActivity(userId, 'group_join', {
          groupId,
          groupName: groupData.name || 'Support Group',
          groupType: groupData.type || 'general'
        })
      }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error joining support group:', error)
    return { success: false, error }
  }
}

export const getSupportGroups = async () => {
  try {
    const groupsRef = collection(db, 'supportGroups')
    const querySnapshot = await getDocs(groupsRef)
    const groups = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return { success: true, data: groups }
  } catch (error) {
    console.error('Error getting support groups:', error)
    return { success: false, error }
  }
}

// Resources Management
export const getResources = async (category?: string) => {
  try {
    const resourcesRef = collection(db, 'resources')
    let q = query(resourcesRef, orderBy('createdAt', 'desc'))
    
    if (category) {
      q = query(resourcesRef, where('category', '==', category), orderBy('createdAt', 'desc'))
    }
    
    const querySnapshot = await getDocs(q)
    const resources = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return { success: true, data: resources }
  } catch (error) {
    console.error('Error getting resources:', error)
    return { success: false, error }
  }
}

export const addResource = async (resourceData: any) => {
  try {
    const resourceRef = await addDoc(collection(db, 'resources'), {
      ...resourceData,
      createdAt: serverTimestamp()
    })
    return { success: true, id: resourceRef.id }
  } catch (error) {
    console.error('Error adding resource:', error)
    return { success: false, error }
  }
}

// Track when a user reads a resource
export const trackResourceRead = async (userId: string, resourceId: string, resourceTitle: string) => {
  try {
    await trackUserActivity(userId, 'resource_read', {
      resourceId,
      title: resourceTitle,
      timestamp: new Date().toISOString()
    })
    return { success: true }
  } catch (error) {
    console.error('Error tracking resource read:', error)
    return { success: false, error }
  }
}

// Get all users for admin dashboard
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users')
    const querySnapshot = await getDocs(usersRef)
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return { success: true, data: users }
  } catch (error) {
    console.error('Error getting all users:', error)
    return { success: false, error }
  }
}

// Get recent user activities for admin dashboard
export const getRecentUserActivities = async (limitCount: number = 20) => {
  try {
    const activitiesRef = collection(db, 'userActivities')
    const q = query(
      activitiesRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    const activities = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return { success: true, data: activities }
  } catch (error) {
    console.error('Error getting recent user activities:', error)
    return { success: false, error }
  }
}

// Get all appointments for admin dashboard
export const getAllAppointments = async () => {
  try {
    const appointmentsRef = collection(db, 'appointments')
    const querySnapshot = await getDocs(appointmentsRef)
    const appointments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return { success: true, data: appointments }
  } catch (error) {
    console.error('Error getting all appointments:', error)
    return { success: false, error }
  }
}

// Get confirmed appointments for admin schedule view
export const getConfirmedAppointments = async () => {
  try {
    const appointmentsRef = collection(db, 'appointments')
    const q = query(
      appointmentsRef,
      where('status', '==', 'confirmed'),
      orderBy('date', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    const appointments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return { success: true, data: appointments }
  } catch (error) {
    console.error('Error getting confirmed appointments:', error)
    return { success: false, error }
  }
}

// Analytics for Admin
export const getAnalytics = async () => {
  try {
    // Get user counts
    const usersRef = collection(db, 'users')
    const usersSnapshot = await getDocs(usersRef)
    const totalUsers = usersSnapshot.size
    
    // Get recent assessments
    const assessmentsRef = collection(db, 'assessments')
    const recentAssessmentsQuery = query(
      assessmentsRef,
      orderBy('createdAt', 'desc'),
      limit(100)
    )
    const assessmentsSnapshot = await getDocs(recentAssessmentsQuery)
    
    // Calculate average wellness score
    let totalScore = 0
    let assessmentCount = 0
    
    assessmentsSnapshot.docs.forEach(doc => {
      const data = doc.data()
      if (data.wellnessScore) {
        totalScore += data.wellnessScore
        assessmentCount++
      }
    })
    
    const averageWellnessScore = assessmentCount > 0 ? totalScore / assessmentCount : 0
    
    return {
      success: true,
      data: {
        totalUsers,
        recentAssessments: assessmentsSnapshot.size,
        averageWellnessScore: Math.round(averageWellnessScore)
      }
    }
  } catch (error) {
    console.error('Error getting analytics:', error)
    return { success: false, error }
  }
}

// User Activity Tracking
export const trackUserActivity = async (userId: string, activityType: string, details?: any) => {
  try {
    const today = new Date()
    const todayDateString = today.toISOString().split('T')[0] // YYYY-MM-DD format
    
    // Add activity log
    await addDoc(collection(db, 'userActivities'), {
      userId,
      activityType, // 'login', 'assessment', 'resource_read', 'group_join', etc.
      details: details || {},
      date: todayDateString,
      timestamp: serverTimestamp()
    })
    
    // Update user's activity streak and last active date
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      const userData = userDoc.data()
      const lastActiveDate = userData.lastActiveDate
      const currentStreak = userData.activityStreak || 0
      
      let newStreak = currentStreak
      
      // If this is the first activity today
      if (!lastActiveDate || lastActiveDate !== todayDateString) {
        // Check if this continues the streak (yesterday) or starts a new one
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayString = yesterday.toISOString().split('T')[0]
        
        if (lastActiveDate === yesterdayString) {
          // Continue streak
          newStreak = currentStreak + 1
        } else if (!lastActiveDate || lastActiveDate !== todayDateString) {
          // Start new streak or reset
          newStreak = 1
        }
        
        await updateDoc(userRef, {
          lastActiveDate: todayDateString,
          activityStreak: newStreak,
          lastActivityTimestamp: serverTimestamp()
        })
      }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error tracking user activity:', error)
    return { success: false, error }
  }
}

export const getUserActivityStats = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    let activityStreak = 0
    let lastActiveDate = null
    
    if (userDoc.exists()) {
      const userData = userDoc.data()
      activityStreak = userData.activityStreak || 0
      lastActiveDate = userData.lastActiveDate
    }
    
    // Get activity counts for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const startDate = thirtyDaysAgo.toISOString().split('T')[0]
    
    const activitiesRef = collection(db, 'userActivities')
    const q = query(
      activitiesRef,
      where('userId', '==', userId),
      where('date', '>=', startDate),
      orderBy('date', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const activities = querySnapshot.docs.map(doc => doc.data())
    
    // Count different types of activities
    const activityCounts = {
      assessments: activities.filter(a => a.activityType === 'assessment').length,
      resourcesRead: activities.filter(a => a.activityType === 'resource_read').length,
      groupsJoined: activities.filter(a => a.activityType === 'group_join').length,
      totalActivities: activities.length
    }
    
    // Count unique active days in the last 30 days
    const uniqueDates = new Set(activities.map(a => a.date))
    const daysActive = uniqueDates.size
    
    return {
      success: true,
      data: {
        activityStreak,
        daysActive,
        lastActiveDate,
        activityCounts,
        recentActivities: activities.slice(0, 10) // Last 10 activities
      }
    }
  } catch (error) {
    console.error('Error getting user activity stats:', error)
    return { success: false, error }
  }
}

// Real-time listeners
export const subscribeToUserUpdates = (userId: string, callback: (userData: any) => void) => {
  const userRef = doc(db, 'users', userId)
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data())
    }
  })
}

export const subscribeToSupportGroupUpdates = (groupId: string, callback: (groupData: any) => void) => {
  const groupRef = doc(db, 'supportGroups', groupId)
  return onSnapshot(groupRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() })
    }
  })
}

// Appointment Management System

// Admin Availability Management
export const setAdminAvailability = async (adminId: string, availabilityData: any) => {
  try {
    const availabilityRef = await addDoc(collection(db, 'adminAvailability'), {
      adminId,
      date: availabilityData.date, // YYYY-MM-DD format
      timeSlots: availabilityData.timeSlots, // Array of time slots
      sessionTypes: availabilityData.sessionTypes, // ['individual', 'group'] or specific types
      maxBookings: availabilityData.maxBookings || 1,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return { success: true, id: availabilityRef.id }
  } catch (error) {
    console.error('Error setting admin availability:', error)
    return { success: false, error }
  }
}

export const getAdminAvailability = async (adminId: string, fromDate?: string) => {
  try {
    const availabilityRef = collection(db, 'adminAvailability')
    let q = query(
      availabilityRef,
      where('adminId', '==', adminId),
      where('isActive', '==', true),
      orderBy('date', 'asc')
    )
    
    if (fromDate) {
      q = query(
        availabilityRef,
        where('adminId', '==', adminId),
        where('isActive', '==', true),
        where('date', '>=', fromDate),
        orderBy('date', 'asc')
      )
    }
    
    const querySnapshot = await getDocs(q)
    const availability = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return { success: true, data: availability }
  } catch (error) {
    console.error('Error getting admin availability:', error)
    return { success: false, error }
  }
}

// Get available time slots using new booking system
export const getAvailableTimeSlots = async (date: string, sessionType: string, mentorId?: string) => {
  try {
    console.log('Firebase: Getting available slots for date:', date, 'sessionType:', sessionType, 'mentorId:', mentorId)
    
    // Default available time slots
    const defaultSlots = [
      '09:00-10:00', '10:00-11:00', '11:00-12:00', 
      '14:00-15:00', '15:00-16:00', '16:00-17:00'
    ]
    
    // Get all available mentors if no specific mentor is requested
    let availableMentors = []
    if (mentorId) {
      availableMentors = [mentorId]
    } else {
      // Get all mentors from users collection where role includes 'admin' or 'mentor'
      const usersRef = collection(db, 'users')
      const mentorsQuery = query(
        usersRef,
        where('role', 'in', ['admin', 'mentor', 'teacher'])
      )
      
      const mentorsSnapshot = await getDocs(mentorsQuery)
      availableMentors = mentorsSnapshot.docs.map(doc => doc.id)
      console.log('Firebase: Found', availableMentors.length, 'available mentors:', availableMentors)
    }
    
    // Get confirmed bookings for the same date from the new bookings collection
    const bookingsRef = collection(db, 'bookings')
    const bookingsQuery = query(
      bookingsRef,
      where('date', '==', date),
      where('approvalStatus', '==', 'confirmed')
    )
    
    const bookingsSnapshot = await getDocs(bookingsQuery)
    const confirmedBookings = bookingsSnapshot.docs.map(doc => doc.data())
    console.log('Firebase: Found', confirmedBookings.length, 'confirmed bookings for date:', date)
    
    // Process available slots for all mentors
    const availableSlots = []
    
    for (const currentMentorId of availableMentors) {
      for (const timeSlot of defaultSlots) {
        // Check if this slot is already confirmed for this mentor
        const slotConfirmed = confirmedBookings.some(
          booking => booking.mentorId === currentMentorId && booking.timeSlot === timeSlot
        )
        
        if (!slotConfirmed) {
          availableSlots.push({
            availabilityId: `${currentMentorId}_${timeSlot}`,
            mentorId: currentMentorId,
            timeSlot,
            sessionType,
            date,
            status: 'available'
          })
        } else {
          console.log(`Firebase: Slot ${timeSlot} unavailable for mentor ${currentMentorId} - already confirmed`)
        }
      }
    }
    
    console.log('Firebase: Returning', availableSlots.length, 'available slots')
    return { success: true, data: availableSlots }
  } catch (error: any) {
    console.error('Firebase: Error getting available time slots:', error)
    return { success: false, error: error.message || 'Unknown error' }
  }
}

// Legacy function for backward compatibility
export const getAvailableTimeSlotsLegacy = async (date: string, sessionType: string, adminId?: string) => {
  // Redirect to new function but adjust return format for compatibility
  // adminId becomes mentorId in new system
  const result = await getAvailableTimeSlots(date, sessionType, adminId)
  if (result.success) {
    // Convert mentorId back to adminId for backward compatibility
    const compatibleSlots = result.data.map(slot => ({
      ...slot,
      adminId: slot.mentorId
    }))
    return { success: true, data: compatibleSlots }
  }
  return result
}

// Legacy function for updating appointment status - redirects to new booking system
export const updateAppointmentStatus = async (appointmentId: string, status: string, adminNotes?: string) => {
  console.log('Firebase: updateAppointmentStatus called - redirecting to new booking system')
  
  // Convert legacy status to new approval status
  let approvalStatus: string
  switch (status) {
    case 'confirmed':
      approvalStatus = 'confirmed'
      break
    case 'cancelled':
      approvalStatus = 'rejected'
      break
    case 'completed':
      approvalStatus = 'completed'
      break
    case 'pending':
      approvalStatus = 'pending'
      break
    default:
      approvalStatus = status
  }
  
  // Use new booking system function
  return await updateBookingStatus(appointmentId, approvalStatus, adminNotes)
}

// =======================
// NEW BOOKING SYSTEM
// =======================

// Create a new booking in the bookings collection
export const createBooking = async (bookingData: {
  studentId: string
  mentorId: string
  date: string
  timeSlot: string
  sessionType: 'individual' | 'group'
  notes?: string
  studentInfo: {
    name: string
    email: string
    phone?: string
  }
}) => {
  try {
    console.log('Firebase: Creating new booking:', bookingData)
    
    // Check if the slot is already confirmed for another student
    const bookingsRef = collection(db, 'bookings')
    const conflictQuery = query(
      bookingsRef,
      where('mentorId', '==', bookingData.mentorId),
      where('date', '==', bookingData.date),
      where('timeSlot', '==', bookingData.timeSlot),
      where('approvalStatus', '==', 'confirmed')
    )
    
    const conflictBookings = await getDocs(conflictQuery)
    console.log('Firebase: Found', conflictBookings.size, 'confirmed bookings for this slot')
    
    if (conflictBookings.size > 0) {
      return {
        success: false,
        error: 'This time slot is already confirmed for another student. Please choose a different time.'
      }
    }
    
    // Check if this student already has a booking for the same slot
    const duplicateQuery = query(
      bookingsRef,
      where('studentId', '==', bookingData.studentId),
      where('mentorId', '==', bookingData.mentorId),
      where('date', '==', bookingData.date),
      where('timeSlot', '==', bookingData.timeSlot),
      where('approvalStatus', 'in', ['pending', 'confirmed'])
    )
    
    const duplicateBookings = await getDocs(duplicateQuery)
    if (duplicateBookings.size > 0) {
      return {
        success: false,
        error: 'You already have a booking request for this time slot.'
      }
    }
    
    // Create the booking document
    const bookingDoc = {
      studentId: bookingData.studentId,
      mentorId: bookingData.mentorId,
      date: bookingData.date,
      timeSlot: bookingData.timeSlot,
      sessionType: bookingData.sessionType,
      approvalStatus: 'pending', // 'pending', 'confirmed', 'rejected', 'completed'
      notes: bookingData.notes || '',
      studentInfo: {
        name: bookingData.studentInfo.name,
        email: bookingData.studentInfo.email,
        phone: bookingData.studentInfo.phone || ''
      },
      mentorNotes: '', // Notes from mentor/admin
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    console.log('Firebase: Creating booking document:', bookingDoc)
    const docRef = await addDoc(bookingsRef, bookingDoc)
    console.log('Firebase: Booking created with ID:', docRef.id)
    
    // Track user activity
    try {
      await trackUserActivity(bookingData.studentId, 'booking_created', {
        bookingId: docRef.id,
        mentorId: bookingData.mentorId,
        sessionType: bookingData.sessionType,
        date: bookingData.date,
        timeSlot: bookingData.timeSlot
      })
      console.log('Firebase: Activity tracked successfully')
    } catch (activityError) {
      console.log('Firebase: Failed to track activity:', activityError)
    }
    
    return { success: true, bookingId: docRef.id }
  } catch (error: any) {
    console.error('Firebase: Error creating booking:', error)
    return { success: false, error: error.message || 'Unknown error occurred' }
  }
}

// Get all bookings for a mentor (admin/teacher)
export const getMentorBookings = async (mentorId: string, approvalStatus?: string) => {
  try {
    
    const bookingsRef = collection(db, 'bookings')
    let q
    
    if (approvalStatus) {
      q = query(
        bookingsRef,
        where('mentorId', '==', mentorId),
        where('approvalStatus', '==', approvalStatus)
      )
    } else {
      q = query(
        bookingsRef,
        where('mentorId', '==', mentorId)
      )
    }
    
    const querySnapshot = await getDocs(q)
    
    const bookings = []
    for (const doc of querySnapshot.docs) {
      const bookingData = doc.data()
      
      // Get student wellness data if needed (optional)
      let studentStats = null
      try {
        const studentStatsResult = await getUserActivityStats(bookingData.studentId)
        if (studentStatsResult.success) {
          studentStats = studentStatsResult.data
        }
      } catch (statsError) {
        console.log('Could not load student stats:', statsError)
      }
      
      bookings.push({
        id: doc.id,
        ...bookingData,
        studentStats,
        createdAt: bookingData.createdAt?.toDate?.() || bookingData.createdAt,
        updatedAt: bookingData.updatedAt?.toDate?.() || bookingData.updatedAt
      })
    }
    
    // Sort by createdAt (newest first)
    bookings.sort((a, b) => {
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime()
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime()
      return bTime - aTime
    })
    
    return { success: true, data: bookings }
  } catch (error: any) {
    console.error('Firebase: Error getting mentor bookings:', error)
    return { success: false, error: error.message || 'Unknown error' }
  }
}

// Get all bookings for a student
export const getStudentBookings = async (studentId: string) => {
  try {
    
    const bookingsRef = collection(db, 'bookings')
    const q = query(
      bookingsRef,
      where('studentId', '==', studentId)
    )
    
    const querySnapshot = await getDocs(q)
    const bookings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
    }))
    
    // Sort by date (newest first)
    bookings.sort((a, b) => {
      const aDate = new Date(a.date).getTime()
      const bDate = new Date(b.date).getTime()
      if (bDate !== aDate) {
        return bDate - aDate
      }
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime()
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime()
      return bTime - aTime
    })
    
    return { success: true, data: bookings }
  } catch (error: any) {
    console.error('Firebase: Error getting student bookings:', error)
    return { success: false, error: error.message || 'Unknown error' }
  }
}

// Update booking approval status (for mentors/admins)
export const updateBookingStatus = async (bookingId: string, approvalStatus: string, mentorNotes?: string) => {
  try {
    console.log('Firebase: Updating booking status:', bookingId, 'to:', approvalStatus)
    
    const bookingRef = doc(db, 'bookings', bookingId)
    const updateData: any = {
      approvalStatus,
      updatedAt: serverTimestamp()
    }
    
    if (mentorNotes) {
      updateData.mentorNotes = mentorNotes
    }
    
    await updateDoc(bookingRef, updateData)
    
    // Track activity
    try {
      // Get booking data to track activity
      const bookingDoc = await getDoc(bookingRef)
      if (bookingDoc.exists()) {
        const bookingData = bookingDoc.data()
        await trackUserActivity(bookingData.studentId, 'booking_status_updated', {
          bookingId,
          newStatus: approvalStatus,
          mentorId: bookingData.mentorId,
          date: bookingData.date,
          timeSlot: bookingData.timeSlot
        })
      }
    } catch (activityError) {
      console.log('Firebase: Failed to track activity:', activityError)
    }
    
    console.log('Firebase: Booking status updated successfully')
    return { success: true }
  } catch (error: any) {
    console.error('Firebase: Error updating booking status:', error)
    return { success: false, error: error.message || 'Unknown error' }
  }
}

// Legacy function for backward compatibility - now uses new booking system
export const bookAppointment = async (appointmentData: any) => {
  console.log('Firebase: bookAppointment called - redirecting to new booking system')
  return await createBooking({
    studentId: appointmentData.studentId,
    mentorId: appointmentData.adminId, // adminId becomes mentorId
    date: appointmentData.date,
    timeSlot: appointmentData.timeSlot,
    sessionType: appointmentData.sessionType,
    notes: appointmentData.notes,
    studentInfo: {
      name: appointmentData.studentName || 'Student',
      email: appointmentData.studentEmail || 'student@example.com',
      phone: appointmentData.studentPhone || ''
    }
  })
}


// Get appointments for an admin (legacy function - now uses new booking system)
export const getAdminAppointments = async (adminId: string, status?: string) => {
  console.log('Firebase: getAdminAppointments called - redirecting to new booking system')
  
  // Convert legacy status to new approval status
  let approvalStatus: string | undefined
  if (status) {
    switch (status) {
      case 'pending':
        approvalStatus = 'pending'
        break
      case 'confirmed':
        approvalStatus = 'confirmed'
        break
      case 'cancelled':
        approvalStatus = 'rejected'
        break
      case 'completed':
        approvalStatus = 'completed'
        break
      default:
        approvalStatus = status
    }
  }
  
  // Use new booking system with mentor ID (adminId becomes mentorId)
  const result = await getMentorBookings(adminId, approvalStatus)
  
  if (result.success) {
    // Convert booking data to legacy appointment format for compatibility
    const appointments = result.data.map(booking => ({
      id: booking.id,
      studentId: booking.studentId,
      adminId: booking.mentorId, // mentorId becomes adminId for compatibility
      date: booking.date,
      timeSlot: booking.timeSlot,
      sessionType: booking.sessionType,
      status: booking.approvalStatus, // approvalStatus becomes status
      notes: booking.notes,
      adminNotes: booking.mentorNotes,
      studentInfo: booking.studentInfo,
      studentStats: booking.studentStats,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }))
    
    return { success: true, data: appointments }
  }
  
  return result
}

// Email notification function (simulated - would integrate with actual email service)
const sendAppointmentEmail = async (appointmentData: any, status: string) => {
  try {
    // This would integrate with a real email service like SendGrid, Mailgun, etc.
    // For now, we'll simulate the email sending
    console.log('📧 Sending email notification:')
    console.log('To:', appointmentData.studentInfo.email)
    console.log('Subject:', `Appointment ${status === 'confirmed' ? 'Confirmed' : 'Update'}`)
    console.log('Status:', status)
    console.log('Date:', appointmentData.date)
    console.log('Time:', appointmentData.timeSlot)
    
    // In a real implementation, you would:
    // 1. Use a service like Firebase Functions with email provider
    // 2. Send actual email with appointment details
    // 3. Include calendar invite attachment
    // 4. Add professional contact information
    
    // Simulate successful email sending
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}


// Get admin profiles (for student selection)
export const getAdminProfiles = async () => {
  try {
    const usersRef = collection(db, 'users')
    
    // First try to get admins with isAvailableForBooking flag
    let q = query(
      usersRef,
      where('role', '==', 'admin'),
      where('isAvailableForBooking', '==', true)
    )
    
    let querySnapshot = await getDocs(q)
    
    // If no admins found with the flag, try just role-based query
    if (querySnapshot.empty) {
      q = query(usersRef, where('role', '==', 'admin'))
      querySnapshot = await getDocs(q)
    }
    
    const admins = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    return { success: true, data: admins }
  } catch (error) {
    console.error('Error getting admin profiles:', error)
    return { success: false, error }
  }
}

// =============================================================================
// PEER CHAT SYSTEM - Collections: chatList, chatMessages
// =============================================================================

// Get volunteer profiles (for student selection)
export const getVolunteerProfiles = async () => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(
      usersRef,
      where('role', '==', 'volunteer'),
      where('isAvailableForChat', '==', true)
    )
    
    const querySnapshot = await getDocs(q)
    const volunteers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return { success: true, data: volunteers }
  } catch (error) {
    console.error('Error getting volunteer profiles:', error)
    return { success: false, error }
  }
}

// Create a new chat session between student and volunteer
export const createChatSession = async (studentId: string, volunteerId: string) => {
  try {
    const batch = writeBatch(db)
    
    // Generate anonymous ID for student (userX format)
    const anonymousId = `user${Date.now().toString().slice(-6)}`
    
    const chatData = {
      studentId,
      volunteerId,
      studentAnonymousId: anonymousId,
      status: 'active', // active, ended, escalated
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
      messageCount: 0,
      isUrgent: false,
      escalatedToAdmin: false
    }
    
    const chatRef = doc(collection(db, 'chats'))
    batch.set(chatRef, chatData)
    
    await batch.commit()
    
    return { success: true, chatId: chatRef.id, anonymousId }
  } catch (error) {
    console.error('Error creating chat session:', error)
    return { success: false, error }
  }
}

// Send a message in a chat
export const sendChatMessage = async (chatId: string, senderId: string, content: string, senderType: 'student' | 'volunteer') => {
  try {
    const batch = writeBatch(db)
    
    // Add message to chatMessages collection
    const messageData = {
      chatId,
      senderId,
      senderType,
      content,
      timestamp: serverTimestamp(),
      isRead: false
    }
    
    const messageRef = doc(collection(db, 'chatMessages'))
    batch.set(messageRef, messageData)
    
    // Update chat list with last message info
    const chatRef = doc(db, 'chats', chatId)
    batch.update(chatRef, {
      updatedAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
      lastMessage: content.length > 100 ? content.substring(0, 100) + '...' : content,
      lastMessageBy: senderType,
      messageCount: increment(1)
    })
    
    await batch.commit()
    
    return { success: true, messageId: messageRef.id }
  } catch (error) {
    console.error('Error sending chat message:', error)
    return { success: false, error }
  }
}

// Get chat messages for a specific chat
export const getChatMessages = async (chatId: string, limitCount: number = 50) => {
  try {
    const messagesRef = collection(db, 'chatMessages')
    const q = query(
      messagesRef,
      where('chatId', '==', chatId)
    )
    
    const querySnapshot = await getDocs(q)
    let messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Sort in JavaScript to avoid index requirements
    messages = messages.sort((a, b) => {
      const aTime = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0
      const bTime = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0
      return aTime - bTime // ascending order
    })
    
    // Limit results in JavaScript
    messages = messages.slice(0, limitCount)
    
    return { success: true, data: messages }
  } catch (error) {
    console.error('Error getting chat messages:', error)
    return { success: false, error }
  }
}

// Get active chats for a volunteer
export const getVolunteerChats = async (volunteerId: string) => {
  try {
    const chatsRef = collection(db, 'chats')
    const q = query(
      chatsRef,
      where('volunteerId', '==', volunteerId)
    )
    
    const querySnapshot = await getDocs(q)
    let chats = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Filter and sort in JavaScript to avoid complex indexes
    chats = chats
      .filter(chat => ['active', 'escalated'].includes(chat.status))
      .sort((a, b) => {
        const aTime = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0
        const bTime = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0
        return bTime - aTime
      })
    
    return { success: true, data: chats }
  } catch (error) {
    console.error('Error getting volunteer chats:', error)
    return { success: false, error }
  }
}

// Get chats for a student
export const getStudentChats = async (studentId: string) => {
  try {
    // Use simple collection reference without complex queries to avoid index requirements
    const chatsRef = collection(db, 'chats')
    const q = query(
      chatsRef,
      where('studentId', '==', studentId)
    )
    
    const querySnapshot = await getDocs(q)
    let chats = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Sort in JavaScript instead of using Firestore orderBy to avoid index
    chats = chats.sort((a, b) => {
      const aTime = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0
      const bTime = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0
      return bTime - aTime
    })
    
    // Fetch volunteer info for each chat
    const chatsWithVolunteerInfo = await Promise.all(
      chats.map(async (chat) => {
        try {
          const volunteerDoc = await getDoc(doc(db, 'users', chat.volunteerId))
          const volunteerInfo = volunteerDoc.exists() ? volunteerDoc.data() : null
          
          return {
            ...chat,
            volunteerInfo
          }
        } catch (error) {
          console.error('Error fetching volunteer info:', error)
          return {
            ...chat,
            volunteerInfo: null
          }
        }
      })
    )
    
    return { success: true, data: chatsWithVolunteerInfo }
  } catch (error) {
    console.error('Error getting student chats:', error)
    return { success: false, error }
  }
}

// Escalate chat to admin (volunteer marks as urgent)
export const escalateChatToAdmin = async (chatId: string, volunteerId: string, reason: string) => {
  try {
    const batch = writeBatch(db)
    
    // Update chat status
    const chatRef = doc(db, 'chats', chatId)
    batch.update(chatRef, {
      isUrgent: true,
      escalatedToAdmin: true,
      escalatedBy: volunteerId,
      escalationReason: reason,
      escalatedAt: serverTimestamp(),
      status: 'escalated'
    })
    
    // Create urgent care alert for admins
    const alertData = {
      chatId,
      volunteerId,
      reason,
      status: 'pending', // pending, acknowledged, resolved
      createdAt: serverTimestamp(),
      acknowledgedBy: null,
      acknowledgedAt: null,
      resolvedAt: null
    }
    
    const alertRef = doc(collection(db, 'urgentCareAlerts'))
    batch.set(alertRef, alertData)
    
    await batch.commit()
    
    return { success: true, alertId: alertRef.id }
  } catch (error) {
    console.error('Error escalating chat to admin:', error)
    return { success: false, error }
  }
}

// Get urgent care alerts for admins
export const getUrgentCareAlerts = async (status?: string) => {
  try {
    const alertsRef = collection(db, 'urgentCareAlerts')
    let q = query(
      alertsRef,
      orderBy('createdAt', 'desc')
    )
    
    if (status) {
      q = query(
        alertsRef,
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      )
    }
    
    const querySnapshot = await getDocs(q)
    const alerts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Fetch additional info for each alert
    const alertsWithInfo = await Promise.all(
      alerts.map(async (alert) => {
        const [chatResult, volunteerResult] = await Promise.all([
          getDoc(doc(db, 'chats', alert.chatId)),
          getDoc(doc(db, 'users', alert.volunteerId))
        ])
        
        const chatData = chatResult.exists() ? chatResult.data() : null
        const volunteerInfo = volunteerResult.exists() ? volunteerResult.data() : null
        let studentInfo = null
        
        if (chatData) {
          const studentResult = await getDoc(doc(db, 'users', chatData.studentId))
          const studentData = studentResult.exists() ? studentResult.data() : null
          studentInfo = studentData ? {
            ...studentData,
            anonymousId: chatData.studentAnonymousId
          } : null
        }
        
        return {
          ...alert,
          chatInfo: chatData,
          volunteerInfo,
          studentInfo
        }
      })
    )
    
    return { success: true, data: alertsWithInfo }
  } catch (error) {
    console.error('Error getting urgent care alerts:', error)
    return { success: false, error }
  }
}

// Update urgent care alert status
export const updateUrgentCareAlert = async (alertId: string, status: string, adminId: string) => {
  try {
    const alertRef = doc(db, 'urgentCareAlerts', alertId)
    
    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    }
    
    if (status === 'acknowledged') {
      updateData.acknowledgedBy = adminId
      updateData.acknowledgedAt = serverTimestamp()
    } else if (status === 'resolved') {
      updateData.resolvedAt = serverTimestamp()
    }
    
    await updateDoc(alertRef, updateData)
    
    return { success: true }
  } catch (error) {
    console.error('Error updating urgent care alert:', error)
    return { success: false, error }
  }
}

// Real-time listeners for chat system
export const subscribeToChatMessages = (chatId: string, callback: (messages: any[]) => void) => {
  const messagesRef = collection(db, 'chatMessages')
  const q = query(
    messagesRef,
    where('chatId', '==', chatId)
  )
  
  return onSnapshot(q, (querySnapshot) => {
    let messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Sort messages in JavaScript to avoid index requirements
    messages = messages.sort((a, b) => {
      const aTime = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0
      const bTime = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0
      return aTime - bTime // ascending order
    })
    
    callback(messages)
  })
}

export const subscribeToVolunteerChats = (volunteerId: string, callback: (chats: any[]) => void) => {
  const chatsRef = collection(db, 'chats')
  const q = query(
    chatsRef,
    where('volunteerId', '==', volunteerId)
  )
  
  return onSnapshot(q, (querySnapshot) => {
    let chats = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Filter and sort in JavaScript to avoid index requirements
    chats = chats
      .filter(chat => ['active', 'escalated'].includes(chat.status))
      .sort((a, b) => {
        const aTime = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0
        const bTime = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0
        return bTime - aTime // descending order (newest first)
      })
    
    callback(chats)
  })
}

export const subscribeToUrgentCareAlerts = (callback: (alerts: any[]) => void) => {
  const alertsRef = collection(db, 'urgentCareAlerts')
  const q = query(
    alertsRef,
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  )
  
  return onSnapshot(q, (querySnapshot) => {
    const alerts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(alerts)
  })
}

// End chat session
export const endChatSession = async (chatId: string) => {
  try {
    const chatRef = doc(db, 'chats', chatId)
    await updateDoc(chatRef, {
      status: 'ended',
      endedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error ending chat session:', error)
    return { success: false, error }
  }
}

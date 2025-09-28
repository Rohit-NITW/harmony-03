import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  getMentorBookings, 
  updateBookingStatus, 
  getUserWellnessScoreTrend,
  getUserActivityStats
} from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'

interface Booking {
  id: string
  studentId: string
  mentorId: string
  date: string
  timeSlot: string
  sessionType: string
  approvalStatus: string
  notes: string
  mentorNotes?: string
  studentInfo: {
    name: string
    email: string
    phone?: string
  }
  createdAt: any
  updatedAt: any
  studentWellness?: any[]
  studentStats?: any
}

export default function SimpleAdminBookings() {
  const { userData } = useAuth()
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<string>('pending')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (userData?.uid) {
      loadAllBookings()
    }
  }, [userData?.uid])

  useEffect(() => {
    // Filter bookings when filter changes
    if (filter === 'all') {
      setFilteredBookings(allBookings)
    } else {
      setFilteredBookings(allBookings.filter(booking => booking.approvalStatus === filter))
    }
  }, [filter, allBookings])

  const loadAllBookings = async () => {
    if (!userData?.uid) {
      setError('Admin user not authenticated')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      console.log('Loading all bookings for admin:', userData.uid)
      
      // Load ALL bookings for this admin (no filter)
      const result = await getMentorBookings(userData.uid)
      
      if (result.success && result.data) {
        console.log('Raw bookings loaded:', result.data.length)
        
        // Enhance bookings with student wellness data
        const enhancedBookings = await Promise.all(
          result.data.map(async (booking) => {
            let enhancedBooking = { ...booking }
            
            try {
              // Get student wellness data
              const wellnessResult = await getUserWellnessScoreTrend(booking.studentId)
              if (wellnessResult.success && wellnessResult.data) {
                enhancedBooking.studentWellness = wellnessResult.data
              }
            } catch (err) {
              console.log('Could not load wellness for:', booking.studentId)
            }
            
            try {
              // Get student activity stats
              const statsResult = await getUserActivityStats(booking.studentId)
              if (statsResult.success && statsResult.data) {
                enhancedBooking.studentStats = statsResult.data
              }
            } catch (err) {
              console.log('Could not load stats for:', booking.studentId)
            }
            
            return enhancedBooking
          })
        )
        
        console.log('Enhanced bookings:', enhancedBookings.length)
        setAllBookings(enhancedBookings)
      } else {
        console.error('Failed to load bookings:', result.error)
        setError('Failed to load bookings: ' + (result.error || 'Unknown error'))
      }
    } catch (err: any) {
      console.error('Exception loading bookings:', err)
      setError('Error loading bookings: ' + (err.message || 'Unknown error'))
    }
    
    setLoading(false)
  }

  const handleStatusUpdate = async (bookingId: string, newStatus: string, notes?: string) => {
    setLoading(true)
    setError('')
    
    try {
      console.log('Admin UI: Updating booking status:', {
        bookingId,
        newStatus,
        notes,
        adminId: userData?.uid
      })
      
      const result = await updateBookingStatus(bookingId, newStatus, notes)
      console.log('Admin UI: Update result:', result)
      
      if (result.success) {
        setSuccess(`Booking ${newStatus} successfully!`)
        console.log('Admin UI: Reloading bookings after status update...')
        await loadAllBookings() // Reload all bookings
        setTimeout(() => setSuccess(''), 3000)
      } else {
        console.error('Admin UI: Failed to update booking:', result.error)
        setError('Failed to update booking: ' + (result.error || 'Unknown error'))
      }
    } catch (err: any) {
      console.error('Admin UI: Exception updating booking:', err)
      setError('Error updating booking: ' + (err.message || 'Unknown error'))
    }
    
    setLoading(false)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeSlot: string) => {
    return timeSlot.replace('-', ' - ')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getLatestWellnessScore = (wellness?: any[]) => {
    if (!wellness || wellness.length === 0) return 'No data'
    const latest = wellness[wellness.length - 1]
    return `${latest.wellnessScore}%`
  }

  const getWellnessScoreColor = (wellness?: any[]) => {
    if (!wellness || wellness.length === 0) return 'text-gray-500'
    const latest = wellness[wellness.length - 1]
    const score = latest.wellnessScore
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Filter counts based on ALL bookings, not just the currently filtered ones
  const pendingCount = allBookings.filter(b => b.approvalStatus === 'pending').length
  const confirmedCount = allBookings.filter(b => b.approvalStatus === 'confirmed').length
  const completedCount = allBookings.filter(b => b.approvalStatus === 'completed').length
  const rejectedCount = allBookings.filter(b => b.approvalStatus === 'rejected').length

  // Show authentication required message if no user
  if (!userData?.uid) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔐</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">
            Please log in as an admin to view booking requests.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Booking Requests</h2>
          <p className="text-gray-600 mt-1">
            Manage appointment requests from students
            {userData?.name && (
              <span className="ml-2 text-sm text-blue-600 font-medium">
                • Logged in as: {userData.name}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={loadAllBookings}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
            </div>
            <div className="text-yellow-500 text-2xl">⏳</div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Confirmed</p>
              <p className="text-2xl font-bold text-green-900">{confirmedCount}</p>
            </div>
            <div className="text-green-500 text-2xl">✅</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Completed</p>
              <p className="text-2xl font-bold text-blue-900">{completedCount}</p>
            </div>
            <div className="text-blue-500 text-2xl">🎯</div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Rejected</p>
              <p className="text-2xl font-bold text-red-900">{rejectedCount}</p>
            </div>
            <div className="text-red-500 text-2xl">❌</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'pending', label: 'Pending', count: pendingCount },
              { id: 'confirmed', label: 'Confirmed', count: confirmedCount },
              { id: 'completed', label: 'Completed', count: completedCount },
              { id: 'rejected', label: 'Rejected', count: rejectedCount },
              { id: 'all', label: 'All', count: allBookings.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  filter === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {filter === 'pending' 
                ? 'No pending booking requests at the moment.' 
                : `No ${filter} bookings found.`
              }
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {booking.studentInfo.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.studentInfo.name}
                      </h3>
                      <p className="text-gray-600">{booking.studentInfo.email}</p>
                      {booking.studentInfo.phone && (
                        <p className="text-sm text-gray-500">{booking.studentInfo.phone}</p>
                      )}
                    </div>
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.approvalStatus)}`}>
                        {booking.approvalStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Date</p>
                      <p className="font-medium">{formatDate(booking.date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Time</p>
                      <p className="font-medium">{formatTime(booking.timeSlot)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Session Type</p>
                      <p className="font-medium capitalize">{booking.sessionType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Current Wellness</p>
                      <p className={`font-medium ${getWellnessScoreColor(booking.studentWellness)}`}>
                        {getLatestWellnessScore(booking.studentWellness)}
                      </p>
                    </div>
                  </div>

                  {/* Student Activity Stats */}
                  {booking.studentStats && (
                    <div className="grid md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {booking.studentStats.activityStreak || 0}
                        </div>
                        <div className="text-xs text-gray-600">Day Streak</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {booking.studentStats.daysActive || 0}
                        </div>
                        <div className="text-xs text-gray-600">Days Active</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">
                          {booking.studentStats.activityCounts?.assessments || 0}
                        </div>
                        <div className="text-xs text-gray-600">Assessments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">
                          {booking.studentStats.activityCounts?.resourcesRead || 0}
                        </div>
                        <div className="text-xs text-gray-600">Resources Read</div>
                      </div>
                    </div>
                  )}

                  {/* Student Notes */}
                  {booking.notes && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Student Notes:</p>
                      <p className="text-sm text-gray-700 bg-blue-50 rounded p-3">{booking.notes}</p>
                    </div>
                  )}

                  {/* Mentor Notes */}
                  {booking.mentorNotes && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Your Notes:</p>
                      <p className="text-sm text-gray-700 bg-green-50 rounded p-3">{booking.mentorNotes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {booking.approvalStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                          disabled={loading}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'rejected', 'Request declined')}
                          disabled={loading}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {booking.approvalStatus === 'confirmed' && (
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'completed')}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}

                    <div className="text-xs text-gray-500 ml-auto">
                      Requested: {booking.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
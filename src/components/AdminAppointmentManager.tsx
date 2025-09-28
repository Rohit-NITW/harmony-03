import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { getMentorBookings, updateBookingStatus, getUserActivityStats, getUserWellnessScoreTrend } from '../services/firebase'
import WellnessScoreTrend from './WellnessScoreTrend'

interface Appointment {
  id: string
  studentId: string
  mentorId: string // Changed from adminId
  date: string
  timeSlot: string
  sessionType: string
  approvalStatus: string // Changed from status
  notes: string
  mentorNotes?: string // Changed from adminNotes
  studentInfo: {
    name: string
    email: string
    phone?: string
  }
  studentStats?: any
  studentWellness?: any[]
  createdAt: Date
  updatedAt: Date
}

export default function AdminAppointmentManager() {
  const { currentUser } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<string>('pending')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (currentUser?.uid) {
      loadAppointments()
    }
  }, [currentUser, filter])

  const loadAppointments = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Use fallback mentor ID for testing - always use admin_001 to match booking system
      const mentorId = 'admin_001'
      
      const result = await getMentorBookings(
        mentorId, 
        filter === 'all' ? undefined : filter
      )
      
      if (result.success) {
        
        // Enhance each booking with student stats if not already present
        const enhancedBookings = []
        for (const booking of result.data) {
          let enhancedBooking = { ...booking }
          
          // Get student stats if not already loaded
          if (!booking.studentStats) {
            try {
              const statsResult = await getUserActivityStats(booking.studentId)
              if (statsResult.success) {
                enhancedBooking.studentStats = statsResult.data
              }
            } catch (statsError) {
              // Silently fail - stats are optional
            }
          }
          
          // Get student wellness trend if not already loaded
          if (!booking.studentWellness) {
            try {
              const wellnessResult = await getUserWellnessScoreTrend(booking.studentId)
              if (wellnessResult.success) {
                enhancedBooking.studentWellness = wellnessResult.data
              }
            } catch (wellnessError) {
              // Silently fail - wellness data is optional
            }
          }
          
          enhancedBookings.push(enhancedBooking)
        }
        
        setAppointments(enhancedBookings)
      } else {
        setError('Failed to load bookings: ' + (result.error || 'Unknown error'))
      }
    } catch (err: any) {
      setError('Error loading bookings: ' + (err.message || 'Unknown error'))
    }
    
    setLoading(false)
  }

  const handleStatusUpdate = async (appointmentId: string, status: string, mentorNotes?: string) => {
    setLoading(true)
    
    try {
      // Convert legacy status to new approval status for compatibility
      let approvalStatus = status
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
      
      const result = await updateBookingStatus(appointmentId, approvalStatus, mentorNotes)
      
      if (result.success) {
        setSuccess(`Booking ${approvalStatus} successfully!`)
        await loadAppointments() // Refresh the list
        setSelectedAppointment(null)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to update booking status: ' + (result.error || 'Unknown error'))
        setTimeout(() => setError(''), 5000)
      }
    } catch (err: any) {
      setError('Error updating booking status: ' + (err.message || 'Unknown error'))
      setTimeout(() => setError(''), 5000)
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

  const formatTimeSlot = (timeSlot: string) => {
    const [start, end] = timeSlot.split('-')
    return `${start} - ${end}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getWellnessScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPendingCount = () => appointments.filter(apt => apt.approvalStatus === 'pending').length
  const getConfirmedCount = () => appointments.filter(apt => apt.approvalStatus === 'confirmed').length
  const getCompletedCount = () => appointments.filter(apt => apt.approvalStatus === 'completed').length
  const getRejectedCount = () => appointments.filter(apt => apt.approvalStatus === 'rejected').length

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Appointment Management</h2>
          <p className="text-slate-600 mt-1">Review and manage student appointments</p>
        </div>
      </div>

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
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{getPendingCount()}</p>
            </div>
            <div className="text-yellow-500 text-2xl">⏳</div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Confirmed</p>
              <p className="text-2xl font-bold text-green-900">{getConfirmedCount()}</p>
            </div>
            <div className="text-green-500 text-2xl">✅</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Completed</p>
              <p className="text-2xl font-bold text-blue-900">{getCompletedCount()}</p>
            </div>
            <div className="text-blue-500 text-2xl">🎯</div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Rejected</p>
              <p className="text-2xl font-bold text-red-900">{getRejectedCount()}</p>
            </div>
            <div className="text-red-500 text-2xl">❌</div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Total</p>
              <p className="text-2xl font-bold text-slate-900">{appointments.length}</p>
            </div>
            <div className="text-slate-500 text-2xl">📅</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'pending', label: 'Pending', count: getPendingCount() },
              { id: 'confirmed', label: 'Confirmed', count: getConfirmedCount() },
              { id: 'completed', label: 'Completed', count: getCompletedCount() },
              { id: 'rejected', label: 'Rejected', count: getRejectedCount() },
              { id: 'all', label: 'All', count: appointments.length }
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

      {/* Appointments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center p-8 bg-slate-50 rounded-lg">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              No {filter === 'all' ? '' : filter} appointments
            </h3>
            <p className="text-slate-600">
              {filter === 'pending' 
                ? 'No pending appointments at the moment.'
                : 'No appointments found for this filter.'
              }
            </p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {appointment.studentInfo.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">{appointment.studentInfo.name}</h3>
                      <p className="text-sm text-slate-600">{appointment.studentInfo.email}</p>
                      {appointment.studentInfo.phone && (
                        <p className="text-sm text-slate-600">{appointment.studentInfo.phone}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.approvalStatus)}`}>
                        {appointment.approvalStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500">Date</p>
                      <p className="font-medium">{formatDate(appointment.date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Time</p>
                      <p className="font-medium">{formatTimeSlot(appointment.timeSlot)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Session Type</p>
                      <p className="font-medium capitalize">{appointment.sessionType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Wellness Score</p>
                      <p className={`font-medium ${
                        appointment.studentWellness && appointment.studentWellness.length > 0
                          ? getWellnessScoreColor(appointment.studentWellness[appointment.studentWellness.length - 1].wellnessScore)
                          : 'text-slate-400'
                      }`}>
                        {appointment.studentWellness && appointment.studentWellness.length > 0
                          ? `${appointment.studentWellness[appointment.studentWellness.length - 1].wellnessScore}%`
                          : 'No data'
                        }
                      </p>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 mb-1">Student Notes:</p>
                      <p className="text-sm text-slate-700 bg-slate-50 rounded p-2">{appointment.notes}</p>
                    </div>
                  )}

                  {appointment.mentorNotes && (
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 mb-1">Your Notes:</p>
                      <p className="text-sm text-slate-700 bg-blue-50 rounded p-2">{appointment.mentorNotes}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedAppointment(appointment)}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 text-sm"
                    >
                      View Details
                    </button>

                    {appointment.approvalStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                          disabled={loading}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, 'rejected', 'Rejected by mentor')}
                          disabled={loading}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {appointment.approvalStatus === 'confirmed' && (
                      <button
                        onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                        disabled={loading}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Appointment Details Modal */}
      <AnimatePresence>
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Appointment Details</h3>
                    <p className="text-blue-100">{selectedAppointment.studentInfo.name}</p>
                  </div>
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="text-white hover:text-blue-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Appointment Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Date:</span>
                        <span className="font-medium">{formatDate(selectedAppointment.date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Time:</span>
                        <span className="font-medium">{formatTimeSlot(selectedAppointment.timeSlot)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Session Type:</span>
                        <span className="font-medium capitalize">{selectedAppointment.sessionType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.approvalStatus)}`}>
                          {selectedAppointment.approvalStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Student Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Name:</span>
                        <span className="font-medium">{selectedAppointment.studentInfo.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Email:</span>
                        <span className="font-medium">{selectedAppointment.studentInfo.email}</span>
                      </div>
                      {selectedAppointment.studentInfo.phone && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Phone:</span>
                          <span className="font-medium">{selectedAppointment.studentInfo.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Student Activity Stats */}
                {selectedAppointment.studentStats && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Student Activity Overview</h4>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-xl font-bold text-orange-600">
                          {selectedAppointment.studentStats.activityStreak}
                        </div>
                        <div className="text-xs text-orange-800">Day Streak</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">
                          {selectedAppointment.studentStats.daysActive}
                        </div>
                        <div className="text-xs text-blue-800">Days Active</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600">
                          {selectedAppointment.studentStats.activityCounts.assessments}
                        </div>
                        <div className="text-xs text-green-800">Assessments</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-600">
                          {selectedAppointment.studentStats.activityCounts.resourcesRead}
                        </div>
                        <div className="text-xs text-purple-800">Resources Read</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Wellness Trend */}
                {selectedAppointment.studentWellness && selectedAppointment.studentWellness.length > 0 && (
                  <WellnessScoreTrend 
                    userId={selectedAppointment.studentId}
                    userName={selectedAppointment.studentInfo.name}
                  />
                )}

                {/* Notes */}
                {(selectedAppointment.notes || selectedAppointment.mentorNotes) && (
                  <div className="space-y-4">
                    {selectedAppointment.notes && (
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-2">Student Notes</h4>
                        <div className="bg-slate-50 rounded-lg p-4">
                          <p className="text-slate-700">{selectedAppointment.notes}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedAppointment.mentorNotes && (
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-2">Mentor Notes</h4>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-slate-700">{selectedAppointment.mentorNotes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-slate-50 px-6 py-4 flex items-center justify-between">
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Close
                </button>

                <div className="flex gap-2">
                  {selectedAppointment.approvalStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(selectedAppointment.id, 'confirmed')}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                      >
                        Approve Appointment
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedAppointment.id, 'rejected', 'Rejected by mentor')}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {selectedAppointment.approvalStatus === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedAppointment.id, 'completed')}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                    >
                      Mark as Complete
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
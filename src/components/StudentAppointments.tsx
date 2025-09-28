import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { getStudentBookings } from '../services/firebase'
import AppointmentBooking from './AppointmentBooking'

interface Appointment {
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
  createdAt: Date
  updatedAt: Date
}

interface StudentAppointmentsProps {
  showBookingButton?: boolean
}

export default function StudentAppointments({ showBookingButton = true }: StudentAppointmentsProps) {
  const { currentUser } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<string>('upcoming')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (currentUser?.uid) {
      loadAppointments()
    }
  }, [currentUser])

  const loadAppointments = async () => {
    if (!currentUser?.uid) return

    setLoading(true)
    setError('')
    
    try {
      console.log('Loading student bookings for user:', currentUser.uid)
      const result = await getStudentBookings(currentUser.uid)
      
      if (result.success) {
        console.log('Loaded student bookings:', result.data)
        setAppointments(result.data)
      } else {
        console.error('Failed to load bookings:', result.error)
        setError('Failed to load appointments: ' + result.error)
      }
    } catch (error: any) {
      console.error('Error loading appointments:', error)
      setError('Error loading appointments: ' + error.message)
    }
    
    setLoading(false)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTimeSlot = (timeSlot: string) => {
    const [start, end] = timeSlot.split('-')
    return `${start} - ${end}`
  }

  const getStatusColor = (approvalStatus: string) => {
    switch (approvalStatus) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (approvalStatus: string) => {
    switch (approvalStatus) {
      case 'pending': return '⏳'
      case 'confirmed': return '✅'
      case 'rejected': return '❌'
      case 'completed': return '🎯'
      default: return '📅'
    }
  }

  const getStatusMessage = (approvalStatus: string) => {
    switch (approvalStatus) {
      case 'pending': return 'Waiting for approval from professional'
      case 'confirmed': return 'Appointment confirmed! Check your email for details'
      case 'rejected': return 'Appointment request was declined'
      case 'completed': return 'Session completed'
      default: return ''
    }
  }

  const filterAppointments = (appointments: Appointment[]) => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    
    switch (filter) {
      case 'upcoming':
        return appointments.filter(apt => 
          (apt.date >= today && (apt.approvalStatus === 'confirmed' || apt.approvalStatus === 'pending'))
        )
      case 'pending':
        return appointments.filter(apt => apt.approvalStatus === 'pending')
      case 'past':
        return appointments.filter(apt => 
          apt.date < today || apt.approvalStatus === 'completed' || apt.approvalStatus === 'rejected'
        )
      case 'all':
      default:
        return appointments
    }
  }

  const filteredAppointments = filterAppointments(appointments)

  const getUpcomingCount = () => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.filter(apt => 
      apt.date >= today && (apt.approvalStatus === 'confirmed' || apt.approvalStatus === 'pending')
    ).length
  }
  const getPendingCount = () => appointments.filter(apt => apt.approvalStatus === 'pending').length
  const getPastCount = () => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.filter(apt => 
      apt.date < today || apt.approvalStatus === 'completed' || apt.approvalStatus === 'rejected'
    ).length
  }

  const handleBookingSuccess = () => {
    setShowBookingModal(false)
    setSuccess('Appointment booked successfully! You will receive an email once it\'s approved.')
    loadAppointments()
    setTimeout(() => setSuccess(''), 5000)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Appointments</h2>
          <p className="text-slate-600 mt-1">Manage your scheduled sessions</p>
        </div>
        {showBookingButton && (
          <button
            onClick={() => setShowBookingModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium"
          >
            Book New Appointment
          </button>
        )}
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
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Upcoming</p>
              <p className="text-2xl font-bold text-blue-900">{getUpcomingCount()}</p>
            </div>
            <div className="text-blue-500 text-2xl">📅</div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{getPendingCount()}</p>
            </div>
            <div className="text-yellow-500 text-2xl">⏳</div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Past</p>
              <p className="text-2xl font-bold text-slate-900">{getPastCount()}</p>
            </div>
            <div className="text-slate-500 text-2xl">📋</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'upcoming', label: 'Upcoming', count: getUpcomingCount() },
              { id: 'pending', label: 'Pending', count: getPendingCount() },
              { id: 'past', label: 'Past', count: getPastCount() },
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
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center p-8 bg-slate-50 rounded-lg">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              No {filter === 'all' ? '' : filter} appointments
            </h3>
            <p className="text-slate-600 mb-4">
              {filter === 'upcoming' 
                ? 'No upcoming appointments scheduled.'
                : filter === 'pending'
                ? 'No pending appointments at the moment.'
                : 'No appointments found for this filter.'
              }
            </p>
            {showBookingButton && filter === 'upcoming' && (
              <button
                onClick={() => setShowBookingModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Book Your First Appointment
              </button>
            )}
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border-2 rounded-lg p-4 ${getStatusColor(appointment.approvalStatus)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">{getStatusIcon(appointment.approvalStatus)}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">
                        {appointment.sessionType.charAt(0).toUpperCase() + appointment.sessionType.slice(1)} Session
                      </h3>
                      <p className="text-sm opacity-75">{getStatusMessage(appointment.approvalStatus)}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs opacity-75 mb-1">Date & Time</p>
                      <p className="font-medium">{formatDate(appointment.date)}</p>
                      <p className="text-sm">{formatTimeSlot(appointment.timeSlot)}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-75 mb-1">Status</p>
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-white/50">
                        {appointment.approvalStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mb-4">
                      <p className="text-xs opacity-75 mb-1">Your Notes:</p>
                      <p className="text-sm bg-white/50 rounded p-2">{appointment.notes}</p>
                    </div>
                  )}

                  {appointment.mentorNotes && (
                    <div className="mb-4">
                      <p className="text-xs opacity-75 mb-1">Professional Notes:</p>
                      <p className="text-sm bg-white/50 rounded p-2">{appointment.mentorNotes}</p>
                    </div>
                  )}

                  {appointment.approvalStatus === 'confirmed' && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-700">✓</span>
                      <span>Confirmed - Check your email for joining details</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Next Appointment Reminder */}
      {filteredAppointments.length > 0 && filter === 'upcoming' && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🔔</div>
            <div>
              <h4 className="font-semibold text-slate-800">Next Appointment</h4>
              <p className="text-sm text-slate-600">
                {formatDate(filteredAppointments[0].date)} at {formatTimeSlot(filteredAppointments[0].timeSlot)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <AppointmentBooking
            onClose={() => setShowBookingModal(false)}
            onSuccess={handleBookingSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getMentorBookings, updateBookingStatus } from '../services/firebase'

interface Booking {
  id: string
  studentId: string
  mentorId: string
  date: string
  timeSlot: string
  sessionType: string
  approvalStatus: string
  notes: string
  mentorNotes: string
  studentInfo: {
    name: string
    email: string
    phone?: string
  }
  studentStats?: any
  createdAt: Date
  updatedAt: Date
}

interface BookingCardProps {
  booking: Booking
  onStatusUpdate: (bookingId: string, status: string, notes?: string) => void
  loading: boolean
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onStatusUpdate, loading }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [mentorNotes, setMentorNotes] = useState(booking.mentorNotes || '')
  const [actionLoading, setActionLoading] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'confirmed': return '✅'
      case 'rejected': return '❌'
      case 'completed': return '🎯'
      default: return '📝'
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setActionLoading(true)
    await onStatusUpdate(booking.id, newStatus, mentorNotes)
    setActionLoading(false)
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
    return timeSlot.replace('-', ' - ')
  }

  return (
    <motion.div
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {booking.studentInfo.name}
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.approvalStatus)}`}>
                {getStatusIcon(booking.approvalStatus)} {booking.approvalStatus.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-600 mb-1">{booking.studentInfo.email}</p>
            {booking.studentInfo.phone && (
              <p className="text-gray-600 mb-1">{booking.studentInfo.phone}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{formatDate(booking.date)}</p>
            <p className="text-sm text-gray-600">{formatTimeSlot(booking.timeSlot)}</p>
            <p className="text-sm text-gray-600 capitalize">{booking.sessionType} Session</p>
          </div>
        </div>

        {booking.notes && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Student Notes:</p>
            <p className="text-sm text-gray-600">{booking.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          
          {booking.approvalStatus === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusUpdate('rejected')}
                disabled={loading || actionLoading}
                className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => handleStatusUpdate('confirmed')}
                disabled={loading || actionLoading}
                className="px-3 py-1 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          )}
          
          {booking.approvalStatus === 'confirmed' && (
            <button
              onClick={() => handleStatusUpdate('completed')}
              disabled={loading || actionLoading}
              className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 p-6"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mentor Notes:
                </label>
                <textarea
                  value={mentorNotes}
                  onChange={(e) => setMentorNotes(e.target.value)}
                  placeholder="Add notes about this session..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div className="text-xs text-gray-500">
                <p>Requested: {booking.createdAt?.toLocaleString()}</p>
                {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
                  <p>Updated: {booking.updatedAt?.toLocaleString()}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function MentorBookingManager() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<string>('pending')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadBookings()
  }, [filter])

  const loadBookings = async () => {
    setLoading(true)
    setError('')
    
    try {
      const mentorId = 'admin_001' // Using default mentor ID for testing
      const result = await getMentorBookings(
        mentorId, 
        filter === 'all' ? undefined : filter
      )
      
      if (result.success) {
        setBookings(result.data)
      } else {
        setError(`Failed to load bookings: ${result.error}`)
      }
    } catch (err: any) {
      setError(`Error loading bookings: ${err.message}`)
    }
    
    setLoading(false)
  }

  const handleStatusUpdate = async (bookingId: string, status: string, notes?: string) => {
    try {
      const result = await updateBookingStatus(bookingId, status, notes)
      
      if (result.success) {
        setSuccess(`Booking ${status} successfully!`)
        await loadBookings() // Refresh the list
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(`Failed to update booking: ${result.error}`)
        setTimeout(() => setError(''), 5000)
      }
    } catch (err: any) {
      setError(`Error updating booking: ${err.message}`)
      setTimeout(() => setError(''), 5000)
    }
  }

  const getFilterCounts = () => {
    return {
      pending: bookings.filter(b => b.approvalStatus === 'pending').length,
      confirmed: bookings.filter(b => b.approvalStatus === 'confirmed').length,
      completed: bookings.filter(b => b.approvalStatus === 'completed').length,
      rejected: bookings.filter(b => b.approvalStatus === 'rejected').length,
      all: bookings.length
    }
  }

  const counts = getFilterCounts()

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Booking Requests</h2>
          <p className="text-gray-600 mt-1">Manage student appointment requests</p>
        </div>
        <button
          onClick={loadBookings}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
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
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{counts.pending}</p>
            </div>
            <div className="text-yellow-500 text-2xl">⏳</div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Confirmed</p>
              <p className="text-2xl font-bold text-green-900">{counts.confirmed}</p>
            </div>
            <div className="text-green-500 text-2xl">✅</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Completed</p>
              <p className="text-2xl font-bold text-blue-900">{counts.completed}</p>
            </div>
            <div className="text-blue-500 text-2xl">🎯</div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Total</p>
              <p className="text-2xl font-bold text-gray-900">{counts.all}</p>
            </div>
            <div className="text-gray-500 text-2xl">📅</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'pending', label: 'Pending', count: counts.pending },
              { id: 'confirmed', label: 'Confirmed', count: counts.confirmed },
              { id: 'completed', label: 'Completed', count: counts.completed },
              { id: 'rejected', label: 'Rejected', count: counts.rejected },
              { id: 'all', label: 'All', count: counts.all }
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
        ) : bookings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No booking requests have been made yet.' 
                : `No ${filter} bookings at the moment.`
              }
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onStatusUpdate={handleStatusUpdate}
                loading={loading}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
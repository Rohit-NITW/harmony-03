import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { 
  setAdminAvailability, 
  getAdminAvailability,
  getAdminAppointments 
} from '../services/firebase'

interface AvailabilitySlot {
  id: string
  date: string
  timeSlots: string[]
  sessionTypes: string[]
  maxBookings: number
  isActive: boolean
}

export default function AdminAvailabilityManager() {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const [appointments, setAppointments] = useState([])
  const [isAddingSlot, setIsAddingSlot] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state for adding new availability
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
  const [sessionTypes, setSessionTypes] = useState<string[]>(['individual'])
  const [maxBookings, setMaxBookings] = useState(1)

  const timeSlots = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ]

  useEffect(() => {
    if (currentUser?.uid) {
      loadAvailabilityData()
    }
  }, [currentUser])

  const loadAvailabilityData = async () => {
    if (!currentUser?.uid) return

    setLoading(true)
    try {
      // Load availability
      const availabilityResult = await getAdminAvailability(currentUser.uid)
      if (availabilityResult.success) {
        setAvailability(availabilityResult.data)
      }

      // Load appointments to show booking status
      const appointmentsResult = await getAdminAppointments(currentUser.uid)
      if (appointmentsResult.success) {
        setAppointments(appointmentsResult.data)
      }
    } catch (error) {
      console.error('Error loading availability data:', error)
      setError('Failed to load availability data')
    }
    setLoading(false)
  }

  const handleAddAvailability = async () => {
    if (!selectedDate || selectedTimes.length === 0 || !currentUser?.uid) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    const result = await setAdminAvailability(currentUser.uid, {
      date: selectedDate,
      timeSlots: selectedTimes,
      sessionTypes,
      maxBookings
    })

    if (result.success) {
      setSuccess('Availability added successfully!')
      setSelectedDate('')
      setSelectedTimes([])
      setSessionTypes(['individual'])
      setMaxBookings(1)
      setIsAddingSlot(false)
      loadAvailabilityData()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.error || 'Failed to add availability')
    }
    setLoading(false)
  }

  const toggleTimeSlot = (timeSlot: string) => {
    setSelectedTimes(prev => 
      prev.includes(timeSlot)
        ? prev.filter(t => t !== timeSlot)
        : [...prev, timeSlot]
    )
  }

  const toggleSessionType = (type: string) => {
    setSessionTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 60) // 2 months in advance
    return maxDate.toISOString().split('T')[0]
  }

  const formatTimeSlot = (timeSlot: string) => {
    const [start, end] = timeSlot.split('-')
    return `${start} - ${end}`
  }

  const getBookingsForSlot = (date: string, timeSlot: string) => {
    return appointments.filter((apt: any) => 
      apt.date === date && 
      apt.timeSlot === timeSlot && 
      apt.status !== 'cancelled'
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manage Your Availability</h2>
          <p className="text-slate-600 mt-1">Set your available times for student appointments</p>
        </div>
        <button
          onClick={() => {
            setIsAddingSlot(true)
            setError('')
            setSuccess('')
          }}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium"
        >
          Add Availability
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

      {/* Add Availability Modal */}
      <AnimatePresence>
        {isAddingSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Add New Availability</h3>
                    <p className="text-blue-100">Set your available times for appointments</p>
                  </div>
                  <button
                    onClick={() => setIsAddingSlot(false)}
                    className="text-white hover:text-blue-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto">
                {/* Date Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getMinDate()}
                    max={getMaxDate()}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Time Slots Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-3">Available Time Slots</label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {timeSlots.map((timeSlot) => (
                      <button
                        key={timeSlot}
                        onClick={() => toggleTimeSlot(timeSlot)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          selectedTimes.includes(timeSlot)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {formatTimeSlot(timeSlot)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Session Types */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-3">Session Types</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => toggleSessionType('individual')}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        sessionTypes.includes('individual')
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      Individual Sessions
                    </button>
                    <button
                      onClick={() => toggleSessionType('group')}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        sessionTypes.includes('group')
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      Group Sessions
                    </button>
                  </div>
                </div>

                {/* Max Bookings */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Max Bookings per Slot (for group sessions)
                  </label>
                  <input
                    type="number"
                    value={maxBookings}
                    onChange={(e) => setMaxBookings(parseInt(e.target.value) || 1)}
                    min="1"
                    max="10"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex items-center justify-between">
                <button
                  onClick={() => setIsAddingSlot(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAvailability}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Availability'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Availability List */}
      <div className="space-y-4">
        {loading && availability.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : availability.length === 0 ? (
          <div className="text-center p-8 bg-slate-50 rounded-lg">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Availability Set</h3>
            <p className="text-slate-600 mb-4">Add your available times to start receiving appointment bookings</p>
            <button
              onClick={() => setIsAddingSlot(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Add Your First Slot
            </button>
          </div>
        ) : (
          availability
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((slot) => (
              <div key={slot.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {new Date(slot.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>Types: {slot.sessionTypes.join(', ')}</span>
                      <span>Max bookings: {slot.maxBookings}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    slot.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {slot.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {slot.timeSlots.map((timeSlot) => {
                    const bookings = getBookingsForSlot(slot.date, timeSlot)
                    return (
                      <div
                        key={timeSlot}
                        className={`p-2 rounded border text-center text-sm ${
                          bookings.length > 0
                            ? 'bg-orange-50 border-orange-200 text-orange-800'
                            : 'bg-green-50 border-green-200 text-green-800'
                        }`}
                      >
                        <div className="font-medium">{formatTimeSlot(timeSlot)}</div>
                        <div className="text-xs">
                          {bookings.length === 0 
                            ? 'Available' 
                            : `${bookings.length} booking${bookings.length > 1 ? 's' : ''}`
                          }
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}
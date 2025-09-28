import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  getUrgentCareAlerts,
  updateUrgentCareAlert,
  subscribeToUrgentCareAlerts
} from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'

interface UrgentAlert {
  id: string
  chatId: string
  volunteerId: string
  reason: string
  status: 'pending' | 'acknowledged' | 'resolved'
  createdAt: any
  acknowledgedBy?: string
  acknowledgedAt?: any
  resolvedAt?: any
  chatInfo?: any
  volunteerInfo?: any
  studentInfo?: any
}

export default function UrgentCareAlerts() {
  const { userData } = useAuth()
  const [alerts, setAlerts] = useState<UrgentAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'acknowledged' | 'resolved'>('pending')

  useEffect(() => {
    loadAlerts()
    
    // Subscribe to real-time updates for pending alerts
    const unsubscribe = subscribeToUrgentCareAlerts((newAlerts) => {
      console.log('New urgent alerts received:', newAlerts)
      // Merge with existing alerts, updating any that exist
      setAlerts(prev => {
        const alertMap = new Map()
        
        // Add existing alerts
        prev.forEach(alert => alertMap.set(alert.id, alert))
        
        // Update with new alerts
        newAlerts.forEach(alert => alertMap.set(alert.id, alert))
        
        return Array.from(alertMap.values()).sort((a, b) => {
          const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0
          const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0
          return bTime - aTime // newest first
        })
      })
    })

    return () => unsubscribe()
  }, [])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const result = await getUrgentCareAlerts()
      if (result.success) {
        setAlerts(result.data)
      }
    } catch (error) {
      console.error('Error loading urgent alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledge = async (alertId: string) => {
    if (!userData?.uid) return

    try {
      const result = await updateUrgentCareAlert(alertId, 'acknowledged', userData.uid)
      if (result.success) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'acknowledged', acknowledgedBy: userData.uid }
            : alert
        ))
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error)
    }
  }

  const handleResolve = async (alertId: string) => {
    if (!userData?.uid) return

    try {
      const result = await updateUrgentCareAlert(alertId, 'resolved', userData.uid)
      if (result.success) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'resolved' }
            : alert
        ))
      }
    } catch (error) {
      console.error('Error resolving alert:', error)
    }
  }

  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true
    return alert.status === filter
  })

  const pendingCount = alerts.filter(alert => alert.status === 'pending').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500">Loading urgent care alerts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            🚨 Urgent Care Alerts
            {pendingCount > 0 && (
              <span className="bg-red-600 text-white text-sm px-2 py-1 rounded-full">
                {pendingCount}
              </span>
            )}
          </h2>
          <p className="text-slate-600">Monitor escalated cases requiring immediate attention</p>
        </div>
        
        <button
          onClick={loadAlerts}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-slate-100 rounded-lg p-1">
        {[
          { key: 'pending', label: 'Pending', count: alerts.filter(a => a.status === 'pending').length },
          { key: 'acknowledged', label: 'Acknowledged', count: alerts.filter(a => a.status === 'acknowledged').length },
          { key: 'resolved', label: 'Resolved', count: alerts.filter(a => a.status === 'resolved').length },
          { key: 'all', label: 'All', count: alerts.length }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              filter === key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredAlerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-slate-50 rounded-xl"
            >
              <div className="text-4xl mb-3">
                {filter === 'pending' ? '✅' : '📋'}
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                {filter === 'pending' ? 'No Pending Alerts' : `No ${filter} Alerts`}
              </h3>
              <p className="text-slate-500">
                {filter === 'pending' 
                  ? 'All urgent cases have been addressed' 
                  : `No alerts with ${filter} status found`}
              </p>
            </motion.div>
          ) : (
            filteredAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-white rounded-xl shadow-sm border-l-4 p-6 ${
                  alert.status === 'pending' ? 'border-red-500' :
                  alert.status === 'acknowledged' ? 'border-yellow-500' :
                  'border-green-500'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        alert.status === 'pending' 
                          ? 'bg-red-100 text-red-700' :
                        alert.status === 'acknowledged'
                          ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                      }`}>
                        {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                      </span>
                      <span className="text-sm text-slate-500">
                        {getTimeAgo(alert.createdAt)}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-slate-800 mb-2">
                      Urgent Case from {alert.volunteerInfo?.name || 'Volunteer'}
                    </h3>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <h4 className="font-medium text-red-800 mb-1">Escalation Reason:</h4>
                      <p className="text-red-700 text-sm">{alert.reason}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Student:</strong> {alert.studentInfo?.anonymousId || 'Anonymous'}</p>
                        <p><strong>Chat ID:</strong> {alert.chatId}</p>
                      </div>
                      <div>
                        <p><strong>Volunteer:</strong> {alert.volunteerInfo?.name || 'Unknown'}</p>
                        <p><strong>Volunteer Email:</strong> {alert.volunteerInfo?.email || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  {alert.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                      >
                        👁️ Acknowledge
                      </button>
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        ✅ Mark Resolved
                      </button>
                    </>
                  )}
                  
                  {alert.status === 'acknowledged' && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      ✅ Mark Resolved
                    </button>
                  )}
                  
                  <button
                    onClick={() => window.open(`mailto:${alert.volunteerInfo?.email}`, '_blank')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    disabled={!alert.volunteerInfo?.email}
                  >
                    📧 Contact Volunteer
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
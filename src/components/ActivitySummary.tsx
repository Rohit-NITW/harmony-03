import React from 'react'
import { motion } from 'framer-motion'

interface ActivityStats {
  activityStreak: number
  daysActive: number
  lastActiveDate: string | null
  activityCounts: {
    assessments: number
    resourcesRead: number
    groupsJoined: number
    totalActivities: number
  }
  recentActivities: any[]
}

interface ActivitySummaryProps {
  activityStats: ActivityStats | null
  loading?: boolean
}

export default function ActivitySummary({ activityStats, loading = false }: ActivitySummaryProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded mb-4 w-1/2"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!activityStats) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📊</div>
          <h4 className="text-lg font-semibold text-slate-800 mb-2">Your Activity Overview</h4>
          <p className="text-slate-500">Start using Harmony to track your wellness journey!</p>
        </div>
      </div>
    )
  }

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🏆'
    if (streak >= 14) return '🔥'
    if (streak >= 7) return '⚡'
    if (streak >= 3) return '✨'
    if (streak >= 1) return '🌟'
    return '💫'
  }

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return 'Incredible dedication! You\'re a wellness champion!'
    if (streak >= 14) return 'Amazing! You\'re building great habits!'
    if (streak >= 7) return 'Fantastic streak! Keep up the momentum!'
    if (streak >= 3) return 'Great start! You\'re building consistency!'
    if (streak >= 1) return 'Nice! Keep the streak going!'
    return 'Ready to start your wellness streak?'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Activity Overview</h3>
      
      {/* Activity Streak Highlight */}
      <motion.div
        className={`mb-6 p-4 rounded-lg ${
          activityStats.activityStreak > 0 
            ? 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200' 
            : 'bg-slate-50 border border-slate-200'
        }`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <div className="text-3xl">
            {getStreakEmoji(activityStats.activityStreak)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-bold text-orange-600">
                {activityStats.activityStreak}
              </span>
              <span className="text-slate-600">day streak</span>
            </div>
            <p className="text-sm text-slate-600">
              {getStreakMessage(activityStats.activityStreak)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Activity Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {activityStats.daysActive}
          </div>
          <p className="text-sm text-blue-800">Days Active</p>
          <p className="text-xs text-blue-600">Last 30 days</p>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {activityStats.activityCounts.totalActivities}
          </div>
          <p className="text-sm text-green-800">Total Actions</p>
          <p className="text-xs text-green-600">This month</p>
        </div>
      </div>

      {/* Activity Breakdown */}
      <div className="space-y-3">
        <h4 className="font-semibold text-slate-700 mb-3">Activity Breakdown</h4>
        
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-lg">✅</span>
            <span className="font-medium text-slate-800">Assessments</span>
          </div>
          <span className="text-lg font-bold text-green-600">
            {activityStats.activityCounts.assessments}
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-lg">📚</span>
            <span className="font-medium text-slate-800">Resources Read</span>
          </div>
          <span className="text-lg font-bold text-blue-600">
            {activityStats.activityCounts.resourcesRead}
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-lg">👥</span>
            <span className="font-medium text-slate-800">Groups Joined</span>
          </div>
          <span className="text-lg font-bold text-purple-600">
            {activityStats.activityCounts.groupsJoined}
          </span>
        </div>
      </div>

      {/* Motivation Message */}
      {activityStats.daysActive < 5 && (
        <motion.div
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💡</span>
            <h4 className="font-semibold text-blue-800">Keep Going!</h4>
          </div>
          <p className="text-sm text-blue-700">
            Consistency is key to wellness. Try to use Harmony regularly to build healthy mental health habits.
          </p>
        </motion.div>
      )}
    </div>
  )
}
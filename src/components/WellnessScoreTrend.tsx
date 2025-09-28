import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getUserWellnessScoreTrend } from '../services/firebase'

interface WellnessData {
  wellnessScore: number
  date: Date
  riskLevel: string
}

interface WellnessScoreTrendProps {
  userId: string
  userName?: string
}

export default function WellnessScoreTrend({ userId, userName = 'User' }: WellnessScoreTrendProps) {
  const [wellnessData, setWellnessData] = useState<WellnessData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWellnessData()
  }, [userId])

  const loadWellnessData = async () => {
    setLoading(true)
    const result = await getUserWellnessScoreTrend(userId)
    if (result.success) {
      setWellnessData(result.data)
    }
    setLoading(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-100'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreStatus = (score: number) => {
    if (score >= 70) return 'Excellent'
    if (score >= 40) return 'Good'
    return 'Needs Attention'
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
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

  const latestScore = wellnessData[wellnessData.length - 1]
  const averageScore = wellnessData.length > 0 
    ? Math.round(wellnessData.reduce((sum, data) => sum + data.wellnessScore, 0) / wellnessData.length)
    : 0

  // Calculate trend
  const trend = wellnessData.length >= 2 
    ? wellnessData[wellnessData.length - 1].wellnessScore - wellnessData[0].wellnessScore
    : 0

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Wellness Score Trend</h3>
          <p className="text-sm text-slate-500">{userName} - Last 4 Weeks</p>
        </div>
        {trend !== 0 && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
            trend > 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
          }`}>
            <span>{trend > 0 ? '↗️' : '↘️'}</span>
            <span>{Math.abs(trend)} points</span>
          </div>
        )}
      </div>

      {wellnessData.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-slate-500">No wellness data available for the last 4 weeks</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className={`text-2xl font-bold mb-1 ${
                latestScore ? getScoreColor(latestScore.wellnessScore).split(' ')[0] : 'text-slate-400'
              }`}>
                {latestScore ? `${latestScore.wellnessScore}%` : '--'}
              </div>
              <p className="text-sm text-slate-600">Latest Score</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className={`text-2xl font-bold mb-1 ${
                averageScore >= 70 ? 'text-green-600' : averageScore >= 40 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {averageScore}%
              </div>
              <p className="text-sm text-slate-600">4-Week Average</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-700 mb-3">Assessment History</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {wellnessData.slice().reverse().map((data, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${getScoreColor(data.wellnessScore)}`}>
                      {data.wellnessScore}%
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{getScoreStatus(data.wellnessScore)}</p>
                      <p className="text-sm text-slate-500">{formatDate(data.date)}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    data.riskLevel === 'Low' ? 'text-green-700 bg-green-100' :
                    data.riskLevel === 'Moderate' || data.riskLevel === 'Mild' ? 'text-yellow-700 bg-yellow-100' :
                    'text-red-700 bg-red-100'
                  }`}>
                    {data.riskLevel} Risk
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recommendations based on trend */}
          {trend !== 0 && (
            <div className={`mt-6 p-4 rounded-lg ${
              trend > 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{trend > 0 ? '🎉' : '💡'}</span>
                <h4 className="font-semibold text-slate-800">
                  {trend > 0 ? 'Great Progress!' : 'Focus Area'}
                </h4>
              </div>
              <p className="text-sm text-slate-700">
                {trend > 0 
                  ? `Wellness score improved by ${trend} points over the last 4 weeks. Keep up the great work!`
                  : `Wellness score decreased by ${Math.abs(trend)} points. Consider additional support resources.`
                }
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
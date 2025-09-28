import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireRole?: 'student' | 'admin' | 'volunteer'
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireRole,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { currentUser, userData, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingSpinner />
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !currentUser) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // If specific role is required but user doesn't have it
  if (requireRole && userData?.role !== requireRole) {
    const defaultRedirect = 
      userData?.role === 'admin' ? '/admin/dashboard' : 
      userData?.role === 'volunteer' ? '/volunteer/dashboard' : '/student/dashboard'
    return <Navigate to={defaultRedirect} replace />
  }

  // If user is logged in but trying to access auth pages
  if (!requireAuth && currentUser) {
    const defaultRedirect = 
      userData?.role === 'admin' ? '/admin/dashboard' : 
      userData?.role === 'volunteer' ? '/volunteer/dashboard' : '/student/dashboard'
    return <Navigate to={defaultRedirect} replace />
  }

  return <>{children}</>
}
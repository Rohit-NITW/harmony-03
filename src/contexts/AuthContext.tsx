import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

interface UserData {
  uid: string
  email: string
  role: 'student' | 'admin' | 'volunteer'
  name: string
  createdAt: Date
  lastLogin: Date
  // Volunteer-specific fields
  bio?: string
  specialties?: string[]
  isAvailableForChat?: boolean
  volunteerSince?: Date
}

interface AuthContextType {
  currentUser: User | null
  userData: UserData | null
  loading: boolean
  logout: () => Promise<void>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUserData = async () => {
    if (currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }
  }

  const logout = async () => {
    await signOut(auth)
    setCurrentUser(null)
    setUserData(null)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        await refreshUserData()
      } else {
        setUserData(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (currentUser) {
      refreshUserData()
    }
  }, [currentUser])

  const value = {
    currentUser,
    userData,
    loading,
    logout,
    refreshUserData
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ChatbotProvider } from './contexts/ChatbotContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import AssessmentPage from './pages/AssessmentPage'
import ResourcesPage from './pages/ResourcesPage'
import CrisisPage from './pages/CrisisPage'
import GroupsPage from './pages/GroupsPage'
import ProgressPage from './pages/ProgressPage'
import FindHelpPage from './pages/FindHelpPage'
import AboutPage from './pages/AboutPage'
import StudentLogin from './pages/auth/StudentLogin'
import AdminLogin from './pages/auth/AdminLogin'
import VolunteerLogin from './pages/auth/VolunteerLogin'
import StudentDashboard from './pages/dashboard/StudentDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import VolunteerDashboard from './pages/dashboard/VolunteerDashboard'
import ProfilePage from './pages/ProfilePage'
import PeerSupportPage from './pages/PeerSupportPage'
import ChatTestPage from './pages/ChatTestPage'
import { withGlobalChatbot } from './components/GlobalChatbot'

// Wrap student components with global chatbot
const StudentDashboardWithChatbot = withGlobalChatbot(StudentDashboard)
const AssessmentPageWithChatbot = withGlobalChatbot(() => <Layout><AssessmentPage /></Layout>)
const ResourcesPageWithChatbot = withGlobalChatbot(() => <Layout><ResourcesPage /></Layout>)
const GroupsPageWithChatbot = withGlobalChatbot(() => <Layout><GroupsPage /></Layout>)
const ProgressPageWithChatbot = withGlobalChatbot(() => <Layout><ProgressPage /></Layout>)
const FindHelpPageWithChatbot = withGlobalChatbot(() => <Layout><FindHelpPage /></Layout>)
const PeerSupportPageWithChatbot = withGlobalChatbot(PeerSupportPage)
const ProfilePageWithChatbot = withGlobalChatbot(ProfilePage)

export default function App() {
  return (
    <AuthProvider>
      <ChatbotProvider>
        <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/about" element={<Layout><AboutPage /></Layout>} />
          <Route path="/crisis" element={<Layout><CrisisPage /></Layout>} />
          
          {/* Auth routes */}
          <Route path="/login" element={
            <ProtectedRoute requireAuth={false}>
              <StudentLogin />
            </ProtectedRoute>
          } />
          <Route path="/admin/login" element={
            <ProtectedRoute requireAuth={false}>
              <AdminLogin />
            </ProtectedRoute>
          } />
          <Route path="/volunteer/login" element={
            <ProtectedRoute requireAuth={false}>
              <VolunteerLogin />
            </ProtectedRoute>
          } />
          
          {/* Student routes with Global Chatbot */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute requireRole="student">
              <StudentDashboardWithChatbot />
            </ProtectedRoute>
          } />
          <Route path="/assessment" element={
            <ProtectedRoute requireRole="student">
              <AssessmentPageWithChatbot />
            </ProtectedRoute>
          } />
          <Route path="/resources" element={
            <ProtectedRoute requireRole="student">
              <ResourcesPageWithChatbot />
            </ProtectedRoute>
          } />
          <Route path="/peer-support" element={
            <ProtectedRoute requireRole="student">
              <PeerSupportPageWithChatbot />
            </ProtectedRoute>
          } />
          <Route path="/progress" element={
            <ProtectedRoute requireRole="student">
              <ProgressPageWithChatbot />
            </ProtectedRoute>
          } />
          <Route path="/find-help" element={
            <ProtectedRoute requireRole="student">
              <FindHelpPageWithChatbot />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute requireRole="student">
              <ProfilePageWithChatbot />
            </ProtectedRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requireRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Volunteer routes */}
          <Route path="/volunteer/dashboard" element={
            <ProtectedRoute requireRole="volunteer">
              <VolunteerDashboard />
            </ProtectedRoute>
          } />
          
          {/* Test route for chat functionality */}
          <Route path="/test-chat" element={<ChatTestPage />} />
          
          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Router>
      </ChatbotProvider>
    </AuthProvider>
  )
}



import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Header from './components/Header'
import Footer from './components/Footer'
import Auth from './pages/Auth'
import Home from './pages/Home'
import ClientDashboard from './pages/ClientDashboard'
import LawyerDashboard from './pages/LawyerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Lawyers from './pages/Lawyers'
import Cases from './pages/Cases'
import FAQ from './pages/FAQ'
import Profile from './pages/Profile'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex justify-center items-center h-screen text-gray-600">Loading...</div>
  if (!user) return <Navigate to="/" replace />
  return <>{children}</>
}

function RoleDashboard() {
  const { role, loading } = useAuth()
  if (loading) return <div className="flex justify-center items-center h-screen text-gray-600">Loading...</div>
  if (role === 'admin') return <AdminDashboard />
  if (role === 'lawyer') return <LawyerDashboard />
  return <ClientDashboard />
}

export default function App() {
  const { user, loading, role } = useAuth()
  const location = useLocation()
  if (loading) return <div className="flex justify-center items-center h-screen text-gray-600">Loading...</div>

  // Hide the global header/footer for all client pages — they use their own nav
  const isClientShell = user && role === 'client'

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      {user && !isClientShell && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={user ? <RoleDashboard /> : <Home />} />
          <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><RoleDashboard /></ProtectedRoute>} />
          <Route path="/lawyers" element={<ProtectedRoute><Lawyers /></ProtectedRoute>} />
          <Route path="/cases" element={<ProtectedRoute><Cases /></ProtectedRoute>} />
          <Route path="/faq" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {location.pathname !== '/auth' && !isClientShell && <Footer />}
    </div>
  )
}
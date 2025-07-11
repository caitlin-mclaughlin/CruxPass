// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import LeaderboardPage from './pages/LeaderboardPage'
import { useAuth } from './context/AuthContext'
import { JSX, useEffect, useState } from 'react'
import api from './services/api'
import FloatingSearch from './components/FloatingSearch'
import Navigation from './components/Navigation'
import RecentComps from './components/RecentComps'
import TopNav from './components/TopNav'

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/" />
}

function useAttachToken() {
  const { token } = useAuth()
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])
}

// Wrap protected routes in a layout with top + bottom nav
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  useAttachToken()
  return (
    <>
      <TopNav />
      <div className="pt-14 pb-16 px-4">{children}</div>
      <Navigation onSearchClick={() => {}} />
    </>
  )
}

export default function App() {
  useAttachToken()
  const [showSearch, setShowSearch] = useState(false)

  return (
    <BrowserRouter>
      <Navigation onSearchClick={() => setShowSearch(prev => !prev)} />
      {showSearch && <FloatingSearch onClose={() => setShowSearch(false)} />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/leaderboards"
          element={
            <PrivateRoute>
              <LeaderboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

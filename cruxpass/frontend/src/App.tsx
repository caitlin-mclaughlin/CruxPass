// App.tsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { JSX, useEffect, useState } from 'react'
import api from './services/api'
import DashboardPage from './pages/DashboardPage'
import FloatingSearch from './components/FloatingSearch'
import LeaderboardPage from './pages/LeaderboardPage'
import LoginPage from './pages/LoginPage'
import Navigation from './components/Navigation'
import ProfilePage from './pages/ProfilePage'
import RecentComps from './components/RecentComps'
import TopNav from './components/TopNav'

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/" />
}

function useAttachToken() {
  const { token } = useAuth();
  useEffect(() => {
    if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
    delete api.defaults.headers.common['Authorization']
    }
  }, [token]);
}

// Layout wrapper with optional sidebar
function AppLayout({ children }: { children: React.ReactNode }) {
  const [showSearch, setShowSearch ] = useState(false)
  const { token } = useAuth();
  const location = useLocation()
  const isLoginPage = location.pathname === '/'

  return (
    <div className="flex min-h-screen">
      {!isLoginPage && (
        <Navigation 
          onSearchClick={() => setShowSearch(prev => !prev)} 
          showProfileOption={token !== null}
        />
      )}
        <div className="flex-1 relative overflow-y-auto">
          {showSearch && <FloatingSearch onClose={() => setShowSearch(false)} />}
          {children}
        </div>
      </div>
    )
}

// Wrap protected routes in a layout with top + bottom nav
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  useAttachToken()
  return (
    <>
      <TopNav />
      <div className="pt-14 pb-16 px-4">{children}</div>
      <Navigation onSearchClick={() => { } } showProfileOption={false} />
    </>
  )
}

export default function App() {
  useAttachToken()

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <DashboardPage />
            }
          />
          <Route
            path="/leaderboards"
            element={
              <LeaderboardPage />
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
      </AppLayout>
    </BrowserRouter>
  )
}

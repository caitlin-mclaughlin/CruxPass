// App.tsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { JSX, useEffect, useState } from 'react'
import api from '@/services/apiService'
import "react-datepicker/dist/react-datepicker.css";

import DashboardPage from '@/pages/DashboardPage'
import FloatingSearch from '@/components/ui/FloatingSearch'
import LeaderboardPage from '@/pages/LeaderboardPage'
import LoginPage from '@/pages/LoginPage'
import Navigation from '@/components/Navigation'
import CompetitionPage from '@/pages/CompetitionPage'
import TopNav from '@/components/TopNav'

import { GymSessionProvider } from '@/context/GymSessionContext'
import { ClimberSessionProvider } from './context/ClimberSessionContext';
import GymCompetitionRouteWrapper from '@/components/GymCompetitionRouteWrapper'
import { GlobalCompetitionsProvider } from './context/GlobalCompetitionsContext';
import LeaderboardRouteWrapper from './components/LeaderboardRouteWrapper';
import { SeriesSessionProvider } from './context/SeriesSessionContext';
import ClimberProfilePage from '@/pages/profiles/ClimberProfilePage'
import GymProfilePage from '@/pages/profiles/GymProfilePage'
import SeriesProfilePage from '@/pages/profiles/SeriesProfilePage'
import { AccountType } from '@/constants/enum'
import { GlobalSeriesProvider } from './context/GlobalSeriesContext';
import { ClimberLookupProvider } from './context/ClimberLookupContext';

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

// Layout wrapper with optional sidebar
function AppLayout({ children }: { children: React.ReactNode }) {
  const [showSearch, setShowSearch] = useState(false)
  const { token } = useAuth()
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
      <Navigation onSearchClick={() => { }} showProfileOption={false} />
    </>
  )
}

// Wrapper to pick correct profile page
function ProfileRoute() {
  const { accountType, guest } = useAuth()

  if (guest) return <Navigate to="/" />
  
  switch (accountType) {
    case AccountType.CLIMBER:
      return <ClimberProfilePage />
    case AccountType.GYM:
      return <GymProfilePage />
    case AccountType.SERIES:
      return <SeriesProfilePage />
    default:
      return <Navigate to="/dashboard" />
  }
}

export default function App() {
  useAttachToken()

  return (
    <BrowserRouter>
      <AuthProvider>
        <GymSessionProvider>
          <ClimberSessionProvider>
            <SeriesSessionProvider>
              <GlobalCompetitionsProvider>
                <GlobalSeriesProvider>
                  <ClimberLookupProvider>
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<LoginPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route
                          path="/competitions/:competitionId/leaderboard"
                          element={
                            <LeaderboardRouteWrapper>
                              <LeaderboardPage />
                            </LeaderboardRouteWrapper>
                          }
                        />
                        <Route 
                          path="/competitions/:competitionId" 
                          element={
                            <GymCompetitionRouteWrapper>
                              <CompetitionPage />
                            </GymCompetitionRouteWrapper>
                          } />
                        <Route
                          path="/profile"
                          element={
                            <PrivateRoute>
                              <ProfileRoute />
                            </PrivateRoute>
                          }
                        />
                      </Routes>
                    </AppLayout>
                  </ClimberLookupProvider>
                </GlobalSeriesProvider>
              </GlobalCompetitionsProvider>
            </SeriesSessionProvider>
          </ClimberSessionProvider>
        </GymSessionProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

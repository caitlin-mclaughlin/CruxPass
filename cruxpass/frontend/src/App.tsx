// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { JSX } from 'react'
import "react-datepicker/dist/react-datepicker.css"

import DashboardPage from '@/pages/DashboardPage'
import LeaderboardPage from '@/pages/LeaderboardPage'
import LoginPage from '@/pages/LoginPage'
import CompetitionPage from '@/pages/competitions/CompetitionPage'
import PublicCompetitionPage from '@/pages/competitions/PublicCompetitionPage'

import { GymSessionProvider } from '@/context/GymSessionContext'
import { ClimberSessionProvider } from './context/ClimberSessionContext'
import GymCompetitionRouteWrapper from '@/components/GymCompetitionRouteWrapper'
import { GlobalCompetitionsProvider } from './context/GlobalCompetitionsContext'
import LeaderboardRouteWrapper from './components/LeaderboardRouteWrapper'
import { SeriesSessionProvider } from './context/SeriesSessionContext'
import ClimberProfilePage from '@/pages/profiles/ClimberProfilePage'
import GymProfilePage from '@/pages/profiles/GymProfilePage'
import SeriesProfilePage from '@/pages/profiles/SeriesProfilePage'
import { AccountType } from '@/constants/enum'
import { GlobalSeriesProvider } from './context/GlobalSeriesContext'
import { ClimberLookupProvider } from './context/ClimberLookupContext'
import { GymLookupProvider } from './context/GymLookupContext'
import { SeriesLookupProvider } from './context/SeriesLookupContext'
import { AppLayout, useAttachToken } from './components/AppLayout'
import CreateOrEditCompetitionPage from './pages/competitions/CreateOrEditCompetitionPage'

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

// Select profile page
function ProfileRoute() {
  const { accountType, guest } = useAuth()

  if (guest) return <Navigate to="/login" />

  switch (accountType) {
    case AccountType.CLIMBER:
      return <ClimberProfilePage />
    case AccountType.GYM:
      return <GymProfilePage />
    case AccountType.SERIES:
      return <SeriesProfilePage />
    default:
      return <Navigate to="/" />
  }
}

function CompetitionRoute() {
  const { accountType, token } = useAuth()

  if (token && accountType === AccountType.GYM) {
    return (
      <GymCompetitionRouteWrapper>
        <CompetitionPage />
      </GymCompetitionRouteWrapper>
    )
  }

  return (
    <LeaderboardRouteWrapper>
      <PublicCompetitionPage />
    </LeaderboardRouteWrapper>
  )
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
                  <GymLookupProvider>
                    <ClimberLookupProvider>
                      <SeriesLookupProvider>
                        <AppLayout>
                          <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/" element={<DashboardPage />} />
                            <Route 
                              path="/competitions/new"
                              element={
                                <PrivateRoute>
                                  <CreateOrEditCompetitionPage />
                                </PrivateRoute>
                            } />
                            <Route 
                              path="/competitions/:competitionId/edit" 
                              element={
                                <PrivateRoute>
                                  <CreateOrEditCompetitionPage />
                                </PrivateRoute>
                            } />
                            <Route
                              path="/competitions/:competitionId/leaderboard"
                              element={
                                <PrivateRoute>
                                  <LeaderboardRouteWrapper>
                                    <LeaderboardPage />
                                  </LeaderboardRouteWrapper>
                                </PrivateRoute>
                              }
                            />
                            <Route 
                              path="/competitions/:competitionId" 
                              element={<CompetitionRoute />}
                            />
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
                      </SeriesLookupProvider>
                    </ClimberLookupProvider>
                  </GymLookupProvider>
                </GlobalSeriesProvider>
              </GlobalCompetitionsProvider>
            </SeriesSessionProvider>
          </ClimberSessionProvider>
        </GymSessionProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

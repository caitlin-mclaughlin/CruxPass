// DashboardPage.tsx
import { useEffect, useState } from 'react'
import api from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import CreateCompetitionModal from '@/components/modals/CreateCompetitionModal'
import RegisterModal from '@/components/modals/RegisterModal'
import { useGymSession } from '@/context/GymSessionContext'
import { useClimber } from '@/context/ClimberContext'
import { formatAddress, formatDate, formatDateTimePretty, formatGroupsInOrder } from '@/utils/formatters'
import { CompetitionEnumMap, CompetitorGroup, GenderEnumMap } from '@/constants/enum'
import { isEligibleForGroup } from '@/utils/ageEligibility'
import { CompetitionFormPayload } from '@/types/dto'

export default function DashboardPage() {
  const [comps, setComps] = useState<Competition[]>([])
  const { token } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const { gymSession } = useGymSession()
  const { climber } = useClimber()
  const gymAddress = gymSession?.gymAddress ?? ''
  const gymName = gymSession?.gymName ?? ''
  const [expandedIds, setExpandedIds] = useState<number[]>([])
  const navigate = useNavigate()
  const [registerComp, setRegisterComp] = useState<Competition | null>(null)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const liveRegisteredComp = comps.find(c => c.status === 'LIVE' && c.registered)

  const handleNewCompetition = (data: CompetitionFormPayload) => {
    api.post(`/gyms/${gymSession?.id}/competitions`, data)
      .then(() => window.location.reload())
      .catch(err => console.error('Failed to create competition', err))
  }

  const openRegisterModal = (comp: Competition) => {
    if (!token) {
      navigate('/', { state: { redirectTo: `/dashboard` } });
      return;
    }
    
    setRegisterComp(comp)
    setShowRegisterModal(true)
  }

  useEffect(() => {
    const fetchComps = async () => {
      try {
        const res = await api.get('/competitions') // ← always get all
        if (Array.isArray(res.data)) {
          const sorted = res.data.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          setComps(sorted)
        } else {
          console.error('Unexpected competitions response:', res.data)
        }
      } catch (err) {
        console.error('Error loading competitions', err)
      }
    }
    fetchComps()
  }, [])

  const toggleExpanded = (id: number) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleShowRegistrations = (competitionId: number) => {
    if (!gymSession) return
    navigate(`/competitions/${competitionId}`, { state: { redirectTo: `/dashboard` } })
  }

  const isClimberEligible = (comp: Competition): boolean => {
    if (!climber) return true
    return comp.competitorGroups.some(group => isEligibleForGroup(climber.dob, group as CompetitorGroup))
  }

  const visibleComps = comps.filter(comp => comp.status === 'UPCOMING' || comp.status === 'LIVE')

  return (
    <div className="p-8 bg-background text-green flex flex-col h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Upcoming Competitions</h1>
        {gymSession && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-green text-background font-bold px-4 py-2 text-1xl shadow rounded-md hover:bg-select cursor-pointer"
          >
            New Competition
          </button>
        )}
      </div>

      <CreateCompetitionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleNewCompetition}
        gymName={gymName}
        gymAddress={gymAddress}
      />

      {climber && liveRegisteredComp && (
        <div className="bg-green text-background p-4 mb-4 rounded shadow-md flex justify-between items-center">
          <div>You are currently competing in <strong>{liveRegisteredComp.name}</strong>!</div>
          <button
            onClick={() => navigate(`/competitions/${liveRegisteredComp.id}/score-entry`)}
            className="bg-shadow text-green font-bold px-3 py-1 rounded-md hover:bg-background"
          >
            Enter Scores
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {visibleComps.map(comp => {
          const isHost = gymSession?.id === comp.gymId

          return (
            <div
              key={comp.id}
              className={`border p-4 rounded-md shadow flex items-center justify-between ${
                isHost ? 'bg-shadow border-highlight text-highlight' : 'bg-shadow text-green'
              }`}
            >
              <div>
                <div
                  className="flex items-center gap-x-2 font-semibold cursor-pointer"
                  onClick={() => toggleExpanded(comp.id)}
                >
                  <span>{comp.name}</span>
                  <span className={`transform -translate-y-[2px] transition-transform ${expandedIds.includes(comp.id) ? 'rotate-180' : ''}`}>▼</span>
                  {comp.status === 'LIVE' && (
                    <span className="px-4 py-1 font-semibold text-background bg-accent rounded-md">LIVE</span>
                  )}
                </div>

                {!expandedIds.includes(comp.id) && (
                  <div>
                    {formatDate(comp.date)} — {comp.hostGymName}: {formatAddress(comp.location)}
                  </div>
                )}

                {expandedIds.includes(comp.id) && (
                  <div className="mt-2 text-sm space-y-1">
                    <div><strong>Date & Time:</strong> {formatDateTimePretty(comp.date)}</div>
                    <div><strong>Registration Deadline:</strong> {formatDateTimePretty(comp.deadline)}</div>
                    <div><strong>Host Gym:</strong> {comp.hostGymName}</div>
                    <div><strong>Location:</strong> {formatAddress(comp.location)}</div>
                    <div><strong>Format:</strong> {CompetitionEnumMap[comp.format as keyof typeof CompetitionEnumMap]}</div>
                    <div><strong>Type(s):</strong> {comp.types.map(t => CompetitionEnumMap[t as keyof typeof CompetitionEnumMap]).join(', ')}</div>
                    <div><strong>Groups:</strong> {formatGroupsInOrder(comp.competitorGroups)}</div>
                    <div><strong>Divisions:</strong> {comp.divisions.map(t => GenderEnumMap[t as keyof typeof GenderEnumMap]).join(', ')}</div>

                    {comp.registration && (
                      <div className="text-highlight">
                        <strong>Registered for:</strong>{' '}
                        {GenderEnumMap[comp.registration.gender as keyof typeof GenderEnumMap]}'s{' '}
                        {CompetitionEnumMap[comp.registration.competitorGroup as keyof typeof CompetitionEnumMap]}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!gymSession ? (
                <button
                  className={`px-4 py-2 rounded-md font-semibold shadow text-background ${
                    comp.registered
                      ? 'bg-highlight'
                      : isClimberEligible(comp)
                        ? 'bg-green hover:bg-select'
                        : 'bg-accent cursor-not-allowed'
                  }`}
                  onClick={() => openRegisterModal(comp)}
                  disabled={comp.registered || !isClimberEligible(comp)}
                >
                  {comp.registered ? 'Registered' : isClimberEligible(comp) ? 'Register' : 'Not Eligible'}
                </button>
              ) : (
                isHost && (
                  <button
                    className="px-4 py-2 rounded-md font-semibold shadow cursor-pointer text-background bg-green hover:bg-select"
                    onClick={() => handleShowRegistrations(comp.id)}
                  >
                    See Registrations
                  </button>
                )
              )}
            </div>
          )
        })}

      </div>

      {registerComp && (
        <RegisterModal
          open={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          competition={registerComp}
          onSuccess={(registration: any) => {
            setComps(prev => prev.map(c =>
              c.id === registerComp.id ? { ...c, registered: true, registration } : c
            ))
          }}

        />
      )}
    </div>
  )
}

// pages/DashboardPage.tsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateCompetitionModal from '@/components/modals/CreateCompetitionModal'
import RegisterModal from '@/components/modals/RegisterModal'
import AddScoresModal from '@/components/modals/AddScoresModal'
import { CalendarPlus } from 'lucide-react'

import { useGymSession } from '@/context/GymSessionContext'
import { useClimberSession } from '@/context/ClimberSessionContext'
import { useGlobalCompetitions } from '@/context/GlobalCompetitionsContext'
import { formatAddress, formatDate, formatGroupsInOrder } from '@/utils/formatters'
import { CompetitionEnumMap, CompetitorGroup, GenderEnumMap } from '@/constants/enum'
import { isEligibleForGroup } from '@/utils/ageEligibility'
import { CompetitionFormPayload } from '@/models/dtos'
import { CompetitionSummary } from '@/models/domain'
import { displayDateTime } from '@/utils/datetime'
import { ClimberCompetitionProvider } from '@/context/ClimberCompetitionContext'
import { Button } from '@/components/ui/Button'

export default function DashboardPage() {
  const { 
    competitions = [], 
    loading: competitionsLoading,
    refreshCompetitions,
  } = useGlobalCompetitions()

  const { gym, createCompetition, refreshGym } = useGymSession()
  const { climber } = useClimberSession()
  const navigate = useNavigate()

  const [expandedIds, setExpandedIds] = useState<number[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showScoresModal, setShowScoresModal] = useState(false)
  const [registerComp, setRegisterComp] = useState<CompetitionSummary | null>(null)

  // Refresh competitions whenever Dashboard mounts
  useEffect(() => {
    refreshCompetitions()
  }, [refreshCompetitions])

  const gymName = gym?.name ?? ""
  const gymAddress = gym ? formatAddress(gym.address) : ""

  const sortedCompetitions = useMemo(
    () => (competitions ?? []).slice().sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    ),
    [competitions]
  )

  const liveRegisteredComp = sortedCompetitions.find(
    c => c.compStatus === 'LIVE' && c.registered
  )
  
  // Create competition
  const handleNewCompetition = async (data: CompetitionFormPayload) => {
    if (!gym) return
    try {
      await refreshGym()
      await createCompetition(data)
      await refreshCompetitions()
    } catch (err) {
      console.error('Failed to create competition', err)
    }
  }

  // Open register modal
  const openRegisterModal = (comp: CompetitionSummary) => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/', { state: { redirectTo: `/dashboard` } })
      return
    }
    if (climber) {
      setRegisterComp(comp)
      setShowRegisterModal(true)
    }
  }

  // Open add scores modal
  const openScoresModal = () => {
    if (!climber) {
      navigate('/', { state: { redirectTo: `/dashboard` } })
      return
    }
    setShowScoresModal(true)
  }

  const handleShowRegistrations = (competitionId: number) => {
    if (!gym) return
    navigate(`/competitions/${competitionId}`, { state: { redirectTo: `/dashboard` } })
  }

  // UI helpers
  const toggleExpanded = (id: number) =>
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  const isClimberEligible = (comp: CompetitionSummary) =>
    climber ? comp.competitorGroups.some((g: string) => isEligibleForGroup(climber.dob, g as CompetitorGroup)) : true

  const visibleComps = sortedCompetitions.filter(c => ['UPCOMING', 'LIVE'].includes(c.compStatus))

  return (
    <div className="p-8 bg-background text-green flex flex-col h-screen">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold">Upcoming Competitions</h1>
        {gym && (
          <Button
            onClick={() => setShowCreateModal(true)}
          >
            <CalendarPlus size={18} /> 
            <span className="relative top-[1px]">New Competition</span>
          </Button>
        )}
      </div>

      <CreateCompetitionModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleNewCompetition}
        gymName={gymName}
        gymAddress={gymAddress}
      />

      {climber && liveRegisteredComp && (
        <div className="bg-green text-background p-4 mb-4 rounded-md shadow-md flex justify-between items-center">
          <div>You are currently competing in <strong>{liveRegisteredComp.name}</strong>!</div>
          <Button
            onClick={async () => openScoresModal()}
          >
            Enter Scores
          </Button>
          <Button
            onClick={() => navigate(`/competitions/${liveRegisteredComp.id}/leaderboard`)}
          >
            View Live Leaderboard
          </Button>
        </div>
      )}

      <div className="grid gap-4">
        {visibleComps.map(comp => {
          const isHost = gym?.id === comp.gymId

          return (
            <div
              key={comp.id}
              className={`border px-3 py-2 rounded-md shadow-md flex items-center justify-between ${
                isHost ? 'bg-shadow border-highlight text-highlight' : 'bg-shadow text-green'
              }`}
            >
              <div>
                <div
                  className="flex items-center gap-x-2 mb-2 font-semibold cursor-pointer"
                  onClick={() => toggleExpanded(comp.id)}
                >
                  <span>{comp.name}</span>
                  <span className={`transform -translate-y-[2px] transition-transform ${expandedIds.includes(comp.id) ? 'rotate-180' : ''}`}>▼</span>
                  {comp.compStatus === 'LIVE' && (
                    <span className="flex px-4 font-semibold text-background bg-accent rounded-md">LIVE</span>
                  )}
                </div>

                {!expandedIds.includes(comp.id) && (
                  <div>
                    {formatDate(new Date(comp.date))} — {comp.hostGymName}: {formatAddress(comp.location)}
                  </div>
                )}

                {expandedIds.includes(comp.id) && (
                  <div className="text-sm space-y-1">
                    <div><strong>Date & Time:</strong> {displayDateTime(comp.date)}</div>
                    <div><strong>Registration Deadline:</strong> {displayDateTime(comp.deadline)}</div>
                    <div><strong>Host Gym:</strong> {comp.hostGymName}</div>
                    <div><strong>Location:</strong> {formatAddress(comp.location)}</div>
                    <div><strong>Format:</strong> {CompetitionEnumMap[comp.compFormat as keyof typeof CompetitionEnumMap]}</div>
                    <div><strong>Type(s):</strong> {comp.types.map((t: string) => CompetitionEnumMap[t as keyof typeof CompetitionEnumMap]).join(', ')}</div>
                    <div><strong>Groups:</strong> {formatGroupsInOrder(comp.competitorGroups)}</div>
                    <div><strong>Divisions:</strong> {comp.divisions.map((t: string) => GenderEnumMap[t as keyof typeof GenderEnumMap]).join(', ')}</div>

                    {comp.registration && (
                      <div className="text-highlight">
                        <strong>Registered for:</strong>{' '}
                        {GenderEnumMap[comp.registration.division as keyof typeof GenderEnumMap]}'s{' '}
                        {CompetitionEnumMap[comp.registration.competitorGroup as keyof typeof CompetitionEnumMap]}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!gym ? (
                <Button
                  className={`${comp.registered
                    ? 'bg-highlight'
                    : isClimberEligible(comp)
                      ? 'bg-green hover:bg-select'
                      : 'bg-accent cursor-not-allowed'
                  }`}
                  onClick={() => openRegisterModal(comp)}
                  disabled={comp.registered || !isClimberEligible(comp)}
                >
                  {comp.registered ? 'Registered' : isClimberEligible(comp) ? 'Register' : 'Not Eligible'}
                </Button>
              ) : (
                isHost && (
                  <Button
                    onClick={() => handleShowRegistrations(comp.id)}
                  >
                    See Registrations
                  </Button>
                )
              )}
            </div>
          )
        })}
      </div>

      {registerComp && (
        <ClimberCompetitionProvider id={registerComp.id}>
          <RegisterModal
            open={showRegisterModal}
            onClose={() => setShowRegisterModal(false)}
            competition={registerComp}
            onSuccess={async () => {
              await refreshCompetitions()
              setShowRegisterModal(false)
            }}
          />
        </ClimberCompetitionProvider>
      )}
      
      {liveRegisteredComp && liveRegisteredComp.registration && (
        <ClimberCompetitionProvider id={liveRegisteredComp.id}>
          <AddScoresModal
            open={showScoresModal}
            onClose={() => setShowScoresModal(false)}
            gymId={liveRegisteredComp.gymId}
            competitionId={liveRegisteredComp.id}
          />
        </ClimberCompetitionProvider>
      )}
    </div>
  )
}

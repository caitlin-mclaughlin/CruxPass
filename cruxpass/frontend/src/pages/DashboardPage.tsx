import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateCompetitionModal from '@/components/modals/CreateCompetitionModal'
import RegisterModal from '@/components/modals/RegisterModal'
import AddScoresModal from '@/components/modals/AddScoresModal'
import { CalendarPlus, Info } from 'lucide-react'

import { useGymSession } from '@/context/GymSessionContext'
import { useClimberSession } from '@/context/ClimberSessionContext'
import { useGlobalCompetitions } from '@/context/GlobalCompetitionsContext'
import { formatAddress, formatDate, formatGroupsInOrder } from '@/utils/formatters'
import { CompetitionEnumMap, CompetitorGroup, DivisionEnumMap } from '@/constants/enum'
import { isEligibleForGroup } from '@/utils/ageEligibility'
import { CompetitionFormPayload } from '@/models/dtos'
import { CompetitionSummary } from '@/models/domain'
import { displayDateTime, formatDateFromString, normalizeBackendDateOrDateTime } from '@/utils/datetime'
import { ClimberCompetitionProvider } from '@/context/ClimberCompetitionContext'
import { Button } from '@/components/ui/Button'
import { useSeriesSession } from '@/context/SeriesSessionContext'
import { useGlobalSeries } from '@/context/GlobalSeriesContext'
import SeriesOnboardingModal from '@/components/modals/SeriesOnboardingModal'

export default function DashboardPage() {
  const { 
    competitions = [], 
    refreshCompetitions,
  } = useGlobalCompetitions()
  
  const { 
    globalSeries = [],
    refreshSeries,
  } = useGlobalSeries()

  const { gym, createCompetition, refreshGym } = useGymSession()
  const { climber } = useClimberSession()
  const { series } = useSeriesSession()
  const navigate = useNavigate()

  const [expandedCompIds, setExpandedCompIds] = useState<number[]>([])
  const [expandedSeriesIds, setExpandedSeriesIds] = useState<number[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showScoresModal, setShowScoresModal] = useState(false)
  const [registerComp, setRegisterComp] = useState<CompetitionSummary | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [activeTab, setActiveTab] = useState<'competitions' | 'series'>('competitions')

  useEffect(() => {
    if (series && !series.startDate) {
      setShowOnboarding(true)
    }
  }, [series])

  useEffect(() => {
    refreshCompetitions()
  }, [refreshCompetitions])

  useEffect(() => {
    refreshSeries()
  }, [refreshSeries])

  const gymName = gym?.name ?? ""
  const gymAddress = gym ? formatAddress(gym.address) : ""

  const sortedCompetitions = useMemo(
    () => (competitions ?? []).slice().sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    ),
    [competitions]
  )

  const visibleComps = sortedCompetitions.filter(c => ['UPCOMING', 'LIVE'].includes(c.compStatus))

  const liveRegisteredComp = sortedCompetitions.find(
    c => c.compStatus === 'LIVE' && c.registered
  )

  const sortedSeries = useMemo(
    () => (globalSeries ?? []).slice().sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    ),
    [globalSeries]
  )

  const visibleSeries = sortedSeries.filter(c => ['UPCOMING', 'LIVE'].includes(c.seriesStatus))

  const liveRegisteredSeries = sortedSeries.find(
    s => s.seriesStatus === 'LIVE'
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

  const toggleExpanded = (id: number, isComp: boolean) => {
    if (isComp) {
      setExpandedCompIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    } else {
      setExpandedSeriesIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }
  }

  const isClimberEligible = (comp: CompetitionSummary) =>
    climber ? comp.competitorGroups.some((g: string) => isEligibleForGroup(climber.dob, g as CompetitorGroup)) : true

  return (
    <div className="p-8 bg-background text-green flex flex-col h-screen">
      {/* Tabs */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('competitions')}
            className={`text-2xl font-bold ${
              activeTab === 'competitions' ? 'border-b-2 border-green' : 'border-b-2 text-prompt border-transparent hover:text-select'
            }`}
          >
            Upcoming Competitions
          </button>
          <button
            onClick={() => setActiveTab('series')}
            className={`text-2xl font-bold ${
              activeTab === 'series' ? 'border-b-2 border-green' : 'border-b-2 text-prompt border-transparent hover:text-select'
            }`}
          >
            Upcoming Series
          </button>
        </div>

        {gym && activeTab === 'competitions' && (
          <Button onClick={() => setShowCreateModal(true)}>
            <CalendarPlus size={18} /> 
            <span className="relative top-[1px]">New Competition</span>
          </Button>
        )}
      </div>

      {/* Competitions view */}
      {activeTab === 'competitions' && (
        <>
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
              <Button onClick={async () => openScoresModal()}>Enter Scores</Button>
              <Button onClick={() => navigate(`/competitions/${liveRegisteredComp.id}/leaderboard`)}>View Live Leaderboard</Button>
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
                      className="flex items-center gap-x-2 mb-1 font-semibold cursor-pointer"
                      onClick={() => toggleExpanded(comp.id, true)}
                    >
                      <span>{comp.name}</span>
                      <span className={`transform -translate-y-[2px] transition-transform ${expandedCompIds.includes(comp.id) ? 'rotate-180' : ''}`}>▼</span>
                      {comp.compStatus === 'LIVE' && (
                        <span className="flex px-4 font-semibold text-background bg-accent rounded-md">LIVE</span>
                      )}
                    </div>

                    {!expandedCompIds.includes(comp.id) && (
                      <div>
                        {formatDate(new Date(comp.date))} — {comp.hostGymName}: {formatAddress(comp.location)}
                      </div>
                    )}

                    {expandedCompIds.includes(comp.id) && (
                      <div className="text-sm space-y-1">
                        <div><strong>Date & Time:</strong> {displayDateTime(comp.date)}</div>
                        <div><strong>Registration Deadline:</strong> {displayDateTime(comp.deadline)}</div>
                        <div><strong>Host Gym:</strong> {comp.hostGymName}</div>
                        <div><strong>Location:</strong> {formatAddress(comp.location)}</div>
                        <div><strong>Format:</strong> {CompetitionEnumMap[comp.compFormat as keyof typeof CompetitionEnumMap]}</div>
                        <div><strong>Type(s):</strong> {comp.types.map((t: string) => CompetitionEnumMap[t as keyof typeof CompetitionEnumMap]).join(', ')}</div>
                        <div><strong>Groups:</strong> {formatGroupsInOrder(comp.competitorGroups)}</div>
                        <div><strong>Divisions:</strong> {comp.divisions.map((t: string) => DivisionEnumMap[t as keyof typeof DivisionEnumMap]).join(', ')}</div>
                        {comp.registration && (
                          <div className="text-highlight">
                            <strong>Registered for:</strong>{' '}
                            {DivisionEnumMap[comp.registration.division as keyof typeof DivisionEnumMap]}'s{' '}
                            {CompetitionEnumMap[comp.registration.competitorGroup as keyof typeof CompetitionEnumMap]}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {climber ? (
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
                      <Button onClick={() => handleShowRegistrations(comp.id)}>
                        <Info size={18} />
                        <span className="relative top-[1px]">See Details</span>
                      </Button>
                    )
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Series view */}
      {activeTab === 'series' && (
        <div className="grid gap-4">
          {globalSeries ? (
            <>
              {visibleSeries.map(s => {
                const isHost = series?.id === s.id
                return (
                  <div
                    key={s.id}
                    className={`border px-3 py-2 rounded-md shadow-md flex items-center justify-between ${
                      isHost ? 'bg-shadow border-highlight text-highlight' : 'bg-shadow text-green'
                    }`}
                  >
                    <div>
                      <div
                        className="flex items-center gap-x-2 mb-2 font-semibold cursor-pointer"
                        onClick={() => toggleExpanded(s.id, false)}
                      >
                        <span>{s.name}</span>
                        <span className={`transform -translate-y-[2px] transition-transform ${expandedSeriesIds.includes(s.id) ? 'rotate-180' : ''}`}>▼</span>
                        {s.seriesStatus === 'LIVE' && (
                          <span className="flex px-4 py-0.5 items-center justify-center font-semibold text-background bg-accent rounded-md">LIVE</span>
                        )}
                      </div>

                      {/* Collapsed view */}
                      {!expandedSeriesIds.includes(s.id) && (
                        <div>
                          {s.startDate ? formatDateFromString(s.startDate) : 'TBD'} – {s.endDate ? formatDateFromString(s.endDate) : 'TBD'}
                        </div>
                      )}

                      {/* Expanded details */}
                      {expandedSeriesIds.includes(s.id) && (
                        <div className="text-sm space-y-1">
                          {s.description && (
                            <div><strong>Description:</strong> {s.description}</div>
                          )}
                          <div><strong>Start Date:</strong> {displayDateTime(s.startDate)}</div>
                          <div><strong>End Date:</strong> {displayDateTime(s.endDate)}</div>
                          <div><strong>Registration Deadline:</strong> {displayDateTime(s.deadline)}</div>
                          <div><strong>Contact Email:</strong> {s.email}</div>
                        </div>
                      )}
                    </div>

                    {/* Registration Button */}
                    {climber ? (
                      <Button
                        className={`${s.registered
                          ? 'bg-highlight'
                          : 'bg-green hover:bg-select'
                        }`}
                        onClick={() => {}}
                        disabled={s.registered}
                      >
                        {s.registered ? 'Registered' : 'Register'}
                      </Button>
                    ) : gym ? (
                      <Button>{'Join Series'}</Button>
                    ) : (
                      isHost && (
                        <Button onClick={() => navigate('/profile')}>
                          <Info size={18} />
                          <span className="relative top-[1px]">See Details</span>
                        </Button>
                      )
                    )}
                  </div>
                )
              })}
            </>
          ) : (
            <div>No upcoming series.</div>
          )}
        </div>
      )}

      {/* Modals */}
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

      {showOnboarding && (
        <SeriesOnboardingModal
          series={series}
          open={showOnboarding}
          onClose={() => setShowOnboarding(false)}
        />
      )}
    </div>
  )
}

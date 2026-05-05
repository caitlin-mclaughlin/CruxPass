import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateCompetitionModal from '@/components/modals/CreateCompetitionModal'
import RegisterModal from '@/components/modals/RegisterModal'
import AddScoresModal from '@/components/modals/AddScoresModal'
import { CalendarPlus, Info } from 'lucide-react'

import { useGymSession } from '@/context/GymSessionContext'
import { useClimberSession } from '@/context/ClimberSessionContext'
import { useGlobalCompetitions } from '@/context/GlobalCompetitionsContext'
import { formatAddress } from '@/utils/formatters'
import { DefaultCompetitorGroup } from '@/constants/enum'
import { isEligibleForGroup } from '@/utils/ageEligibility'
import { CreateCompetitionDto } from '@/models/dtos'
import { CompetitionEntity } from '@/models/domain'
import { displayDateTime, formatDateFromString } from '@/utils/datetime'
import { getSummaryDefaultGroups } from '@/utils/competitionSummary'
import { ClimberCompetitionProvider } from '@/context/ClimberCompetitionContext'
import { Button } from '@/components/ui/Button'
import { useSeriesSession } from '@/context/SeriesSessionContext'
import { useGlobalSeries } from '@/context/GlobalSeriesContext'
import SeriesOnboardingModal from '@/components/modals/SeriesOnboardingModal'
import PageContainer from '@/components/PageContainer'
import FloatingActionButton from '@/components/ui/FloatingActionButton'
import { CompetitionSummaryCard } from '@/components/ui/cards/CompetitionSummaryCard'

export default function DashboardPage() {
  const { 
    competitions = [], 
    refreshCompetitions,
  } = useGlobalCompetitions()
  
  const { 
    globalSeries = [],
    refreshSeries,
  } = useGlobalSeries()

  const { gym, createCompetition, refreshGym, refreshGymCustomGroups } = useGymSession()
  const { climber, competitionIds, refreshCompetitionIds } = useClimberSession()
  const { series } = useSeriesSession()
  const navigate = useNavigate()

  const [expandedCompIds, setExpandedCompIds] = useState<number[]>([])
  const [expandedSeriesIds, setExpandedSeriesIds] = useState<number[]>([])
  const [showCompModal, setShowCompModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showScoresModal, setShowScoresModal] = useState(false)
  const [registerComp, setRegisterComp] = useState<CompetitionEntity | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [activeTab, setActiveTab] = useState<'competitions' | 'series'>('competitions')

  useEffect(() => {
    if (series && (!series.startDate || !series.endDate || !series.deadline)) {
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
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    ),
    [competitions]
  )

  const visibleComps = sortedCompetitions.filter(c => ['UPCOMING', 'LIVE'].includes(c.compStatus))

  const registeredCompetitionIdSet = useMemo(
    () => new Set(competitionIds ?? []),
    [competitionIds]
  )

  const liveRegisteredComp = sortedCompetitions.find(
    c => c.compStatus === 'LIVE' && registeredCompetitionIdSet.has(c.id)
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
  const handleNewCompetition = async (data: CreateCompetitionDto) => {
    if (!gym) return
    try {
      await refreshGym()
      await createCompetition(data)
      await refreshCompetitions()
    } catch (err) {
      console.error('Failed to create competition', err)
    }
  }

  const openRegisterModal = (comp: CompetitionEntity) => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login', { state: { redirectTo: `/` } })
      return
    }
    if (climber) {
      setRegisterComp(comp)
      setShowRegisterModal(true)
    }
  }

  const openScoresModal = () => {
    if (!climber) {
      navigate('/login', { state: { redirectTo: `/` } })
      return
    }
    setShowScoresModal(true)
  }

  const openCompetitionDetails = (competitionId: number) => {
    navigate(`/competitions/${competitionId}`, { state: { redirectTo: `/` } })
  }

  const toggleExpanded = (id: number, isComp: boolean) => {
    if (isComp) {
      setExpandedCompIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    } else {
      setExpandedSeriesIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }
  }

  const isClimberEligible = (comp: CompetitionEntity) => {
    if (!climber) return true
    const groups = getSummaryDefaultGroups(comp)
    return groups.some((g: string) => isEligibleForGroup(climber.dob, g as DefaultCompetitorGroup))
  }

  return (
    <PageContainer>
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
      </div>

      {/* Competitions view */}
      {activeTab === 'competitions' && (
        <>
          <CreateCompetitionModal
            open={showCompModal}
            onClose={() => setShowCompModal(false)}
            onSubmit={handleNewCompetition}
            gymName={gymName}
            gymAddress={gymAddress}
          />

          {climber && liveRegisteredComp && (
            <div className="bg-green text-background p-4 mb-4 rounded-md shadow-md flex justify-between items-center">
              <div>You are currently competing in <strong>{liveRegisteredComp.name}</strong>!</div>
              <Button 
                onClick={async () => openScoresModal()}
                className="bg-shadow text-green hover:bg-background"
              >
                Enter Scores
              </Button>
              <Button
                onClick={() => navigate(`/competitions/${liveRegisteredComp.id}/leaderboard`)}
                className="bg-shadow text-green hover:bg-background"
              >
                View Live Leaderboard
              </Button>
            </div>
          )}

          <div className="grid gap-4 overflow-y-auto scrollbar-thin-green scroll-smooth">
            {visibleComps.map(comp => {
              const isHost = gym?.id === comp.gymId
              const climberEligible = isClimberEligible(comp)
              const isRegistered = registeredCompetitionIdSet.has(comp.id)
              return (
                <CompetitionSummaryCard
                  key={comp.id}
                  competition={comp}
                  isHost={isHost}
                  isRegistered={isRegistered}
                  expanded={expandedCompIds.includes(comp.id)}
                  onToggle={() => toggleExpanded(comp.id, true)}
                  action={climber ? (
                    isRegistered ? (
                      <Button onClick={() => navigate(`/competitions/${comp.id}`)}>
                        <Info size={18} />
                        <span className="relative top-[1px]">View Details</span>
                      </Button>
                    ) : (
                      <Button
                        className={`${climberEligible
                          ? 'bg-green hover:bg-select'
                          : 'bg-accent cursor-not-allowed'
                        }`}
                        onClick={() => openRegisterModal(comp)}
                        disabled={!climberEligible}
                      >
                        {climberEligible ? 'Register' : 'Not Eligible'}
                      </Button>
                    )
                  ) : (
                    (isHost || !gym) && (
                      <Button onClick={() => openCompetitionDetails(comp.id)}>
                        <Info size={18} />
                        <span className="relative top-[1px]">See Details</span>
                      </Button>
                    )
                  )}
                />
              )
            })}
          </div>
        </>
      )}

      {/* Series view */}
      {activeTab === 'series' && (
        <div className="grid gap-4 overflow-y-auto scrollbar-thin-green scroll-smooth">
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
                        className="flex items-center gap-x-2 mb-1 font-semibold cursor-pointer"
                        onClick={() => toggleExpanded(s.id, false)}
                      >
                        <span>{s.name}</span>
                        <span className={`transform -translate-y-[2px] transition-transform ${expandedSeriesIds.includes(s.id) ? 'rotate-180' : ''}`}>▼</span>
                        {s.seriesStatus === 'LIVE' && (
                          <div className="flex px-3 py-0.5 text-sm items-center justify-center font-bold text-background bg-accent rounded-md">LIVE</div>
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

      {/* Floating New Competition Button */}
      {gym && activeTab === 'competitions' && (
        <FloatingActionButton
          onClick={() => {
            refreshGymCustomGroups();
            navigate(`/competitions/new`);
          }}
          label="New Competition"
          icon={<CalendarPlus size={18} /> }
        />
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
              await refreshCompetitionIds()
              setShowRegisterModal(false)
            }}
          />
        </ClimberCompetitionProvider>
      )}
      
      {liveRegisteredComp && (
        <ClimberCompetitionProvider id={liveRegisteredComp.id}>
          <AddScoresModal
            open={showScoresModal}
            onClose={() => setShowScoresModal(false)}
            gymId={liveRegisteredComp.gymId}
            competitionId={liveRegisteredComp.id}
          />
        </ClimberCompetitionProvider>
      )}

      {showOnboarding && series && (
        <SeriesOnboardingModal
          open={showOnboarding}
          onClose={async () => {
            setShowOnboarding(false)
            await refreshSeries()
          }}
        />
      )}
    </PageContainer>
  )
}

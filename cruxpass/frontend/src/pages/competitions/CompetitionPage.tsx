import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGymCompetition } from '@/context/GymCompetitionContext'
import { useGymSession } from '@/context/GymSessionContext'
import AddRoutesModal from '@/components/modals/AddRoutesModal'
import { DefaultCompetitorGroupMap, DivisionEnumMap } from '@/constants/enum'
import { GymRegistration } from '@/models/domain'
import { RouteDto } from '@/models/dtos'
import PageContainer from '@/components/PageContainer'
import { LoadingPage } from '@/components/ui/loading/LoadingPage'
import { displayDateTime, displayShortDateTime, prettyDate, prettyDateTime } from '@/utils/datetime'
import { formatAddress, formatCityState } from '@/utils/formatters'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { OverviewTab } from './tabs/OverviewTab'
import { RegistrationsTab } from './tabs/RegistrationsTab'
import { Dot } from 'lucide-react'
import { HeatsTab } from './tabs/HeatsTab'

export default function CompetitionPage() {
  const { competitionId } = useParams<{ competitionId: string }>()
  const { 
    competition, 
    heats,
    registrations,
    routes,
    error,
    gymCompLoading,
    refreshAll,
    refreshRegistrations,
    refreshRoutes,
    updateRegistrations,
    updateRoutes
  } = useGymCompetition()
  const { gym, gymSessionLoading, gymCustomGroups } = useGymSession()
  const navigate = useNavigate()

  const [loadingRegs, setLoadingRegs] = useState(true)
  const [loadingRoutes, setLoadingRoutes] = useState(false)

  const [showRouteModal, setShowRouteModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  const [activeTab, setActiveTab] = useState<'overview' | 'heats' | 'leaderboard' | 'registrations'>('overview')

  // Load registrations on mount or when competition/gym changes
  useEffect(() => {
    if (!gym?.id || !competitionId) return

    setLoadingRegs(true)
    refreshAll(parseInt(competitionId))
  }, [gym?.id, competitionId])

  // Fetch routes on demand (when route modal opens)
  const fetchRoutes = async () => {
    if (!gym?.id || !competitionId) return

    setLoadingRoutes(true)
    try {
      refreshRoutes(parseInt(competitionId))
    } catch (err) {
      console.error('Failed to load routes', err)
    } finally {
      setLoadingRoutes(false)
    }
  }

  // Group registrations by division and group for display
  const groupByGroupAndDivision = () => {
    const grouped: Record<string, GymRegistration[]> = {}
    if (!registrations) return
    for (const reg of registrations) {
      const key = `${DivisionEnumMap[reg.division as keyof typeof DivisionEnumMap]}'s ${reg.competitorGroup.name}`
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(reg)
    }
    return grouped
  }

  const groupedRegs = groupByGroupAndDivision() ?? {}

  const handleEditRoutes = async (routes: RouteDto[]) => {
    try {
      if (!gym?.id || !competitionId) return
      await updateRoutes(parseInt(competitionId), routes)
      setShowRouteModal(false)
    } catch (err) {
      console.error("Failed to update routes", err)
      alert("Could not update routes.")
    }
  }
  
  const openRegisterModal = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login', { state: { redirectTo: `/` } })
      return
    }
    if (gym) {
      setShowRegisterModal(true)
    }
  }

  if (gymSessionLoading || gymCompLoading) return (
    <LoadingPage />
  )
  if (!competition) return (
    <PageContainer>
      <div>Competition not found</div>
    </PageContainer>
  )

  const tabStyle = (active: boolean) => {
    return `text-xl font-bold ${active 
      ? 'border-b-2 border-green' 
      : 'border-b-2 text-prompt border-transparent hover:text-select'}`
  };

  return (
    <PageContainer header={true}>
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold mb-2">{competition.name}</h1>
        <div className="flex flex-wrap items-center justify-center font-semibold text-sm gap-4">
          <StatusBadge compStatus={competition.compStatus} className=""/>
          <div className="flex flex-wrap items-center justify-center font-semibold text-sm gap-4 opacity-80">
            <Dot size={18} />
            <div>
              <span className="inline lg:hidden">{displayShortDateTime(competition.startDate)}</span>
              <span className="hidden lg:inline">{displayDateTime(competition.startDate)}</span>
            </div>
            <Dot size={18} />
            <div>
              <span className="inline sm:hidden text-muted">{competition.hostGymName}</span>
              <span className="hidden sm:inline lg:hidden">{competition.hostGymName} – {formatCityState(competition.location)}</span>
              <span className="hidden lg:inline">{competition.hostGymName} – {formatAddress(competition.location)}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        {/* Tabs */}
        <div className="flex items-center justify-between mt-2 mb-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={tabStyle(activeTab === 'overview')}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('heats')}
              className={tabStyle(activeTab === 'heats')}
            >
              Heats
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={tabStyle(activeTab === 'leaderboard')}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('registrations')}
              className={tabStyle(activeTab === 'registrations')}
            >
              Registrations
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <OverviewTab 
            competitionId={competitionId}
            competition={competition}
            heats={heats}
            gymCustomGroups={gymCustomGroups}
            setActiveTab={setActiveTab}
            setShowRouteModal={setShowRouteModal}
          />
        )}

        {activeTab === 'heats' && (
          <HeatsTab
            heats={heats}
            gymCustomGroups={gymCustomGroups}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'registrations' && (
          <RegistrationsTab
            groupedRegs={groupedRegs}
            openRegisterModal={openRegisterModal}
          />
        )}


        {/* Modals*/}
        <AddRoutesModal
          open={showRouteModal}
          onClose={() => setShowRouteModal(false)}
          onSubmit={(routes) => handleEditRoutes(routes)}
          initialRoutes={routes ?? []}
        />
{/* 
        <RegisterModal
          open={showRegisterModal}
          mode={'gym'}
          onClose={() => setShowRegisterModal(false)}
          competition={competition}
          onSuccess={async () => {
            await refreshCompetition(competition.id)
            setShowRegisterModal(false)
          }}
        />
        */}
      </div>
    </PageContainer>
  )
}

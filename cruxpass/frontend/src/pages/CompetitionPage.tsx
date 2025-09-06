import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGymCompetition } from '@/context/GymCompetitionContext'
import { useGymSession } from '@/context/GymSessionContext'
import CreateCompetitionModal from '@/components/modals/CreateCompetitionModal'
import AddRoutesModal from '@/components/modals/AddRoutesModal'
import { CalendarCheck, PencilLine } from 'lucide-react'
import { formatAddress, formatGroupsInOrder } from '@/utils/formatters'
import { CompetitionEnumMap, CompetitionFormat, CompetitionType, CompetitorGroup, Gender, GenderEnumMap } from '@/constants/enum'
import { GymRegistration } from '@/models/domain'
import { CompetitionFormPayload, RouteDto } from '@/models/dtos'
import { displayDateTime } from '@/utils/datetime'
import { Button } from '@/components/ui/Button'

export default function CompetitionPage() {
  const { competitionId } = useParams<{ competitionId: string }>()
  const { 
    competition, 
    registrations,
    routes,
    loading,
    error, 
    refreshAll,
    refreshCompetition, 
    refreshRegistrations,
    refreshRoutes,
    updateCompetition,
    updateRegistrations,
    updateRoutes
  } = useGymCompetition()
  const { gym } = useGymSession()

  const [loadingRegs, setLoadingRegs] = useState(true)
  const [loadingRoutes, setLoadingRoutes] = useState(false)

  const [showEditModal, setShowEditModal] = useState(false)
  const [showRouteModal, setShowRouteModal] = useState(false)

  // Load registrations on mount or when competition/gym changes
  useEffect(() => {
    if (!gym?.id || !competitionId) return

    setLoadingRegs(true)
    refreshAll(gym.id, parseInt(competitionId))
  }, [gym?.id, competitionId])

  // Fetch routes on demand (when route modal opens)
  const fetchRoutes = async () => {
    if (!gym?.id || !competitionId) return
    setLoadingRoutes(true)
    try {
      refreshRoutes(gym.id, parseInt(competitionId))
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
      const key = `${GenderEnumMap[reg.division as keyof typeof GenderEnumMap]}'s ${CompetitionEnumMap[reg.competitorGroup as keyof typeof CompetitionEnumMap]}`
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(reg)
    }
    return grouped
  }

  const groupedRegs = groupByGroupAndDivision() ?? {}

  const handleEditCompetition = async (updatedData: CompetitionFormPayload) => {
    try {
      if (!gym?.id || !competitionId) return
      await updateCompetition(gym.id, parseInt(competitionId), updatedData)
      setShowEditModal(false)

      await refreshCompetition(gym.id, parseInt(competitionId))
    } catch (err) {
      console.error("Failed to update competition", err)
      alert("Could not update competition.")
    }
  }

  const handleEditRoutes = async (routes: RouteDto[]) => {
    try {
      if (!gym?.id || !competitionId) return
      await updateRoutes(gym.id, parseInt(competitionId), routes)
      setShowRouteModal(false)
    } catch (err) {
      console.error("Failed to update routes", err)
      alert("Could not update routes.")
    }
  }

  if (loading) return <div className="h-screen p-8 text-green bg-background">Loading...</div>
  if (!competition) return <div className="h-screen p-8 text-green bg-background">Competition not found</div>

  return (
    <div className="h-screen p-8 text-green bg-background">
      <h1 className="text-2xl font-bold mb-2">{competition.name}</h1>

      {/* Competition Details Box */}
      <h2 className="text-xl mb-1 font-semibold">Details</h2>
      <div className="mb-3 border rounded-md px-3 py-2 bg-shadow shadow-md max-w-3xl">
        <div><strong>Date & Time:</strong> {displayDateTime(competition.date)}</div>
        <div><strong>Registration Deadline:</strong> {displayDateTime(competition.deadline)}</div>
        <div><strong>Host Gym:</strong> {competition.hostGymName}</div>
        <div><strong>Location:</strong> {formatAddress(competition.location)}</div>
        <div><strong>Format:</strong> {CompetitionEnumMap[competition.compFormat as keyof typeof CompetitionEnumMap]}</div>
        <div><strong>Type(s):</strong> {competition.types.map(t => CompetitionEnumMap[t as keyof typeof CompetitionEnumMap]).join(', ')}</div>
        <div><strong>Groups:</strong> {formatGroupsInOrder(competition.competitorGroups)}</div>
        <div><strong>Divisions: </strong> 
          {competition.divisions?.length 
          ? competition.divisions.map(t => GenderEnumMap[t as keyof typeof GenderEnumMap]).join(', ') 
          : "None"}
          </div>
      </div>

      {gym && gym.id === competition.gymId && (
        <div className="flex justify-between max-w-3xl">
          <Button
              onClick={() => {
              setShowEditModal(true)
            }}
          >
            <CalendarCheck size={18} /> 
            <span className="relative top-[1px]">Edit Competition</span>
          </Button>

          <Button
              className="mb-3"
              onClick={() => {
                fetchRoutes()
                setShowRouteModal(true)
              }}
          >
            <PencilLine size={18} /> 
            <span className="relative top-[1px]">Edit Routes</span>
          </Button>
        </div>
      )}

      {/* Registration Box */}
      <h2 className="text-xl mb-1 font-semibold">Registrations</h2>
      <div className="border rounded-md px-3 py-2 bg-shadow shadow-md max-w-3xl">
        {Object.entries(groupedRegs).map(([groupLabel, climbers]) => (
          <div key={groupLabel} className="mb-2">
            <h3 className="font-semibold underline mb-1">{groupLabel}</h3>
            <ul className="ml-6 list-disc">
              {climbers.map((c, idx) => (
                <li key={idx}>
                  {c.climberName} – <span>{c.climberEmail}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {competition && (
        <CreateCompetitionModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={(updatedData) => handleEditCompetition(updatedData)}
          gymName={competition.hostGymName}
          gymAddress={formatAddress(competition.location)}
          initialData={{
            name: competition.name,
            date: competition.date,
            duration: competition.duration,
            deadline: competition.deadline,
            capacity: competition.capacity,
            compFormat: competition.compFormat as CompetitionFormat,
            types: competition.types as CompetitionType[],
            competitorGroups: competition.competitorGroups as CompetitorGroup[],
            divisions: competition.divisions as Gender[],
            divisionsEnabled: !competition.divisions?.length, 
          }}
        />
      )}
      
      <AddRoutesModal
        open={showRouteModal}
        onClose={() => setShowRouteModal(false)}
        onSubmit={(routes) => handleEditRoutes(routes)}
        initialRoutes={routes}
      />

    </div>
  )
}

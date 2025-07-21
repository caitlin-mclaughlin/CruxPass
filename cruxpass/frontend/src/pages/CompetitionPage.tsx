import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '@/services/api'
import { formatAddress, formatDateTimePretty, formatGroupsInOrder } from '@/utils/formatters'
import { CompetitionEnumMap, CompetitionFormat, CompetitionType, CompetitorGroup, GenderEnumMap } from '@/constants/enum'
import { useGymSession } from '@/context/GymSessionContext'
import CreateCompetitionModal from '@/components/modals/CreateCompetitionModal'
import AddRoutesModal from '@/components/modals/AddRoutesModal'

export default function CompetitionPage() {
  const { competitionId } = useParams()
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const { gymSession } = useGymSession()
  const [showEditModal, setShowEditModal] = useState(false)
  const [editComp, setEditComp] = useState<Competition | null>(null)
  const [showRouteModal, setShowRouteModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!gymSession?.id || !competitionId) return

        const compRes = await api.get(`gyms/${gymSession.id}/competitions/${competitionId}`)
        setCompetition(compRes.data)

        const regRes = await api.get(`gyms/${gymSession.id}/competitions/${competitionId}/registrations`)
        setRegistrations(regRes.data)
      } catch (err) {
        console.error('Failed to load competition or registrations', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [competitionId, gymSession])

  useEffect(() => {
    setCompetition(null)
    setRegistrations([])
    setLoading(true)
  }, [competitionId])

  const groupByGenderAndDivision = () => {
    const grouped: Record<string, Registration[]> = {}
    for (const reg of registrations) {
      const key = `${GenderEnumMap[reg.gender as keyof typeof GenderEnumMap]}'s ${CompetitionEnumMap[reg.competitorGroup as keyof typeof CompetitionEnumMap]}`
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(reg)
    }
    return grouped
  }

  const groupedRegs = groupByGenderAndDivision()

  const handleEditCompetition = async (updatedData: any) => {
    try {
      await api.put(`/gyms/${gymSession?.id}/competitions/${competitionId}`, updatedData)
      setShowEditModal(false)
      // Optionally re-fetch competition data:
      const res = await api.get(`/gyms/${gymSession?.id}/competitions/${competitionId}`)
      setCompetition(res.data)
    } catch (err) {
      console.error("Failed to update competition", err)
      alert("Could not update competition.")
    }
  }

  if (loading) return <div className="h-screen p-8 text-green bg-background">Loading...</div>
  if (!competition) return <div className="h-screen p-8 text-green bg-background">Competition not found</div>

  return (
    <div className="h-screen p-8 text-green bg-background">
      <h1 className="text-2xl font-bold mb-4">{competition.name}</h1>

      {/* Competition Details Box */}
      <div className="mb-2 border rounded-md p-4 bg-shadow max-w-3xl">
        <div><strong>Date & Time:</strong> {formatDateTimePretty(competition.date)}</div>
        <div><strong>Host Gym:</strong> {competition.hostGymName}</div>
        <div><strong>Location:</strong> {formatAddress(competition.location)}</div>
        <div><strong>Format:</strong> {CompetitionEnumMap[competition.format as keyof typeof CompetitionEnumMap]}</div>
        <div><strong>Type(s):</strong> {competition.types.map(t => CompetitionEnumMap[t as keyof typeof CompetitionEnumMap]).join(', ')}</div>
        <div><strong>Groups:</strong> {formatGroupsInOrder(competition.competitorGroups)}</div>
      </div>

      {gymSession && gymSession.id === competition.gymId && (
        <div className="flex justify-between max-w-3xl">
          <button
              className="mb-4 bg-green text-background px-4 py-1 rounded-md font-semibold hover:bg-select"
              onClick={() => {
              setEditComp(competition)
              setShowEditModal(true)
            }}
          >
            Edit Competition
          </button>

          <button
              className="mb-4 bg-green text-background px-4 py-1 rounded-md font-semibold hover:bg-select"
              onClick={() => setShowRouteModal(true)}
          >
            Edit Routes
          </button>
        </div>
      )}

      {/* Registration Box */}
      <h2 className="text-xl mb-1 font-semibold">Registrations</h2>
      <div className="border rounded-md p-4 bg-shadow max-w-3xl">
        {Object.entries(groupedRegs).map(([groupLabel, climbers]) => (
          <div key={groupLabel} className="mb-2">
            <h3 className="font-semibold underline mb-1">{groupLabel}</h3>
            <ul className="ml-6 list-disc">
              {climbers.map((c, idx) => (
                <li key={idx}>
                  {c.climberName} – <span>{c.email}</span>
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
          gymAddress={competition.location.streetAddress + ", " + competition.location.city + ", " 
            + competition.location.state + ", " + competition.location.zipCode}
          initialData={{
            name: competition.name,
            date: competition.date,
            format: competition.format as CompetitionFormat,
            types: competition.types as CompetitionType[],
            competitorGroups: competition.competitorGroups as CompetitorGroup[],
          }}
        />
      )}
      
      <AddRoutesModal
        open={showRouteModal}
        onClose={() => setShowRouteModal(false)}
        onSubmit={(routes) => {
          console.log('Submitted routes:', routes)
          // Send to backend here: api.post(`/competitions/{id}/routes`, routes)
        }}
      />

    </div>
  )
}

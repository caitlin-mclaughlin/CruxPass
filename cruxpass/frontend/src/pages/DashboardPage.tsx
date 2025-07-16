// DashboardPage.tsx
import { useEffect, useState } from 'react'
import api from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import CreateCompetitionModal from '@/components/CreateCompetitionModal'
import { useGymSession } from '@/context/GymSessionContext'
import { formatAddress, formatDate, formatDateTimePretty, formatGroupsInOrder } from '@/utils/formatters'
import { CompetitionEnumMap } from '@/constants/competition'

interface Address {
  streetAddress: string;
  apartmentNumber?: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Competition {
  id: number;
  name: string;
  date: string;
  types: string[];
  format: string;
  competitorGroups: string[];
  location: Address;
  hostGymName: string;
  registered?: boolean;
}

export default function DashboardPage() {
  const [comps, setComps] = useState<Competition[]>([])
  const { token } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const { gymSession } = useGymSession()
  const gymAddress = gymSession?.gymAddress ?? ''
  const gymName = gymSession?.gymName ?? ''
  const [expandedIds, setExpandedIds] = useState<number[]>([])

  console.log("Sending competition with token:", localStorage.getItem("token"))
  const handleNewCompetition = (data: any) => {
    api.post('/competitions', data)
      .then(() => window.location.reload())
      .catch(err => console.error('Failed to create competition', err))
  }

  useEffect(() => {
      api.get('/competitions')
        .then(res => {
          if (Array.isArray(res.data)) {
            const sortedComps = [...res.data].sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            setComps(sortedComps)
          } else {
            console.error("Unexpected competitions response:", res.data)
          }
        })
        .catch(err => console.error('Error loading competitions', err))
  }, [])

  const toggleExpanded = (id: number) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleRegister = (competitionId: number) => {
    if (!token) {
      alert("Please log in to register.");
      return;
    }

    api.post(`/competitions/${competitionId}/register`)
      .then(() => {
        setComps(prev =>
          prev.map(comp =>
            comp.id === competitionId ? { ...comp, registered: true } : comp
          )
        );
      })
      .catch(err => {
        console.error('Registration failed:', err);
        alert('Registration failed. You may already be registered.');
      });
  };

  return (
    <div className="p-8 bg-(--background) text-(--base) flex flex-col h-screen">
      {/* Header + Button container */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Upcoming Competitions</h1>

        {gymSession && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-green text-background font-bold px-4 py-2 text-1xl shadow rounded-md"
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

      <div className="grid gap-4">
        {comps.map(comp => (
          <div
            key={comp.id}
            className="border p-4 rounded-md bg-shadow shadow flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-x-2 font-semibold cursor-pointer" onClick={() => toggleExpanded(comp.id)}>
                <span>{comp.name}</span>
                <span className={`transform translate-y-[-1px] transition-transform ${expandedIds.includes(comp.id) ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </div>
              {!expandedIds.includes(comp.id) && (
                <div>
                  {formatDate(comp.date)} — {comp.hostGymName}: {formatAddress(comp.location)}
                </div>
              )}
              {expandedIds.includes(comp.id) && (
                <div className="mt-2 text-sm space-y-1">
                  <div><strong>Date & Time:</strong> {formatDateTimePretty(comp.date)}</div>
                  <div><strong>Host Gym:</strong> {comp.hostGymName}</div>
                  <div><strong>Location:</strong> {formatAddress(comp.location)}</div>
                  <div><strong>Format:</strong> {CompetitionEnumMap[comp.format as keyof typeof CompetitionEnumMap]}</div>
                  <div>
                    <strong>Type(s):</strong> {comp.types.map(t => CompetitionEnumMap[t as keyof typeof CompetitionEnumMap]).join(', ')}
                  </div>
                  <div>
                    <strong>Groups:</strong> {formatGroupsInOrder(comp.competitorGroups)}
                  </div>
                </div>
              )}

            </div>

            {!gymSession && (
              <button
                className={`px-4 py-2 rounded-md font-semibold shadow text-background ${
                  comp.registered
                  ? 'bg-highlight'
                  : 'bg-base hover:bg-select'
                }`}
                onClick={() => handleRegister(comp.id)}
                disabled={comp.registered}
              >
                {comp.registered ? 'Registered' : 'Register'}
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
  )

}

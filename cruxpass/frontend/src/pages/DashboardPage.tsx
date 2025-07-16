// DashboardPage.tsx
import { useEffect, useState } from 'react'
import api from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import CreateCompetitionModal from '@/components/CreateCompetitionModal'
import { useGymSession } from '@/context/GymSessionContext'
import { formatAddress, formatDate } from '@/utils/formatters'

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

  console.log("Sending competition with token:", localStorage.getItem("token"))
  const handleNewCompetition = (data: any) => {
    api.post('/competitions', data)
      .then(() => window.location.reload())
      .catch(err => console.error('Failed to create competition', err))
  }

  useEffect(() => {
  if (token) {
    api.get('/competitions')
      .then(res => {
        if (Array.isArray(res.data)) {
          setComps(res.data)
        } else {
          console.error("Unexpected competitions response:", res.data)
        }
      })
      .catch(err => console.error('Error loading competitions', err))
  }
}, [token])

  return (
    <div className="p-8 bg-(--background) text-(--base) flex flex-col h-screen">
      {/* Header + Button container */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Upcoming Competitions</h1>

        {gymSession && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-(--base) text-(--background) font-bold px-4 py-2 text-1xl rounded"
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
          <div key={comp.id} className="border p-4 rounded shadow">
            <div className="font-semibold">{comp.name}</div>
            <div>{formatDate(comp.date)}  —  {comp.hostGymName}: {formatAddress(comp.location)}</div>
          </div>
        ))}
      </div>
    </div>
  )

}

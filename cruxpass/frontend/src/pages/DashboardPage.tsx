import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

interface Competition {
  id: number
  name: string
  date: string
  location: string
  registered: boolean
}

export default function DashboardPage() {
  const [comps, setComps] = useState<Competition[]>([])
  const { token } = useAuth()

  useEffect(() => {
    if (token) {
      api.get('/competitions')
        .then(res => setComps(res.data))
        .catch(err => console.error('Error loading competitions', err))
    }
  }, [token])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Upcoming Competitions</h1>
      <div className="grid gap-4">
        {comps.map(comp => (
          <div key={comp.id} className="border p-4 rounded shadow">
            <div className="font-semibold">{comp.name}</div>
            <div>{comp.date} — {comp.location}</div>
            {comp.registered ? (
              <button className="bg-green-600 text-white px-4 py-1 mt-2 rounded">Submit Scores</button>
            ) : (
              <button className="bg-blue-600 text-white px-4 py-1 mt-2 rounded">Register</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

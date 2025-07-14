// RecentComps.tsx
import { useEffect, useState } from 'react'
import api from '@/services/api'

export default function RecentComps() {
  const [comps, setComps] = useState([])

  useEffect(() => {
    api.get('/competitions/recent')
      .then(res => setComps(res.data))
  }, [])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Recent Competitions</h2>
      <ul>
        {comps.map((comp: any) => (
          <li key={comp.id} className="border p-2 mb-2 rounded">{comp.name} — {comp.date}</li>
        ))}
      </ul>
    </div>
  )
}

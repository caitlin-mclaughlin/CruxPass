// LeaderboardPage.tsx
import { useEffect, useState } from 'react'
import api from '../services/api'

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([])

  useEffect(() => {
    api.get('/leaderboards').then(res => setLeaders(res.data))
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Leaderboards</h1>
      {leaders.map((entry: any, i) => (
        <div key={i} className="border-b p-2">
          {i + 1}. {entry.userName} — {entry.score}
        </div>
      ))}
    </div>
  )
}

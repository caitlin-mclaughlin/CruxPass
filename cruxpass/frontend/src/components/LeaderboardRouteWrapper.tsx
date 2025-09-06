// components/CompetitionRouteWrapper.tsx
import { useParams } from 'react-router-dom'
import { LeaderboardProvider } from '@/context/LeaderboardContext'

export default function LeaderboardRouteWrapper({ children }: { children: React.ReactNode }) {
  const { competitionId } = useParams<{ competitionId: string }>()
  if (!competitionId) return <div className="h-screen p-8 text-green bg-background">Invalid competition competitionId</div>

  return (
    <LeaderboardProvider id={parseInt(competitionId)}>
      {children}
    </LeaderboardProvider>
  )
}

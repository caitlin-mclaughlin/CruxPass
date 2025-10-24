// components/CompetitionRouteWrapper.tsx
import { useParams } from 'react-router-dom'
import { LeaderboardProvider } from '@/context/LeaderboardContext'
import { LiveScoresProvider } from '@/context/LiveScoresContext'

export default function LeaderboardRouteWrapper({ children }: { children: React.ReactNode }) {
  const { competitionId } = useParams<{ competitionId: string }>()
  if (!competitionId) return <div className="h-screen p-8 text-green bg-background">Invalid competition competitionId</div>

  return (
    <LiveScoresProvider competitionId={parseInt(competitionId)}>
      <LeaderboardProvider id={parseInt(competitionId)}>
        {children}
      </LeaderboardProvider>
    </LiveScoresProvider>
  )
}

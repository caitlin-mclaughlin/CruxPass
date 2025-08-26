// components/CompetitionRouteWrapper.tsx
import { useParams } from 'react-router-dom'
import { GymCompetitionProvider } from '@/context/GymCompetitionContext'

export default function GymCompetitionRouteWrapper({ children }: { children: React.ReactNode }) {
  const { competitionId } = useParams<{ competitionId: string }>()
  if (!competitionId) return <div className="h-screen p-8 text-green bg-background">Invalid competition competitionId</div>

  return (
    <GymCompetitionProvider id={parseInt(competitionId)}>
      {children}
    </GymCompetitionProvider>
  )
}

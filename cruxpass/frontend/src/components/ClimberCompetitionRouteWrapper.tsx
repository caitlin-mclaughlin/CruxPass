// components/CompetitionRouteWrapper.tsx
import { useParams } from 'react-router-dom'
import { ClimberCompetitionProvider } from '@/context/ClimberCompetitionContext'

export default function ClimberCompetitionRouteWrapper({ children }: { children: React.ReactNode }) {
  const { competitionId } = useParams<{ competitionId: string }>()
  if (!competitionId) return <div className="h-screen p-8 text-green bg-background">Invalid competition competitionId</div>

  return (
    <ClimberCompetitionProvider id={parseInt(competitionId)}>
      {children}
    </ClimberCompetitionProvider>
  )
}

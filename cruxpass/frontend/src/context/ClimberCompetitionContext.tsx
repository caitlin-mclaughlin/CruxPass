// context/CompetitionContext
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { CompetitionSummary, Registration, Route, SubmittedRoute } from '@/models/domain'
import { getCompetition, getMySubmissionsForComp, getMyRegistrationForComp, getRoutesForComp, submitScoresForComp, updateMyRegistrationForComp } from '@/services/climberCompetitionService';
import { CompRegistrationRequestDto, SubmissionRequestDto } from '@/models/dtos';

interface ClimberCompetitionContextType {
  competition: CompetitionSummary | null;
  registration: Registration | null;
  routes: Route[];
  submissions: SubmittedRoute[];
  loading: boolean;
  error: Error | null;
  refreshAll: (gymId: number, competitionId: number) => Promise<void>;
  refreshCompetition: (gymId: number, competitionId: number) => Promise<void>;
  refreshRegistration: (gymId: number, competitionId: number) => Promise<void>;
  refreshRoutes: (gymId: number, competitionId: number) => Promise<void>;
  refreshSubmissions: (gymId: number, competitionId: number) => Promise<void>;
  updateRegistration: (gymId: number, competitionId: number, data: CompRegistrationRequestDto) => Promise<void>;
  updateSubmissions: (gymId: number, competitionId: number, data: SubmissionRequestDto) => Promise<void>;
}

const ClimberCompetitionContext = createContext<ClimberCompetitionContextType>({
  competition: null,
  registration: null,
  routes: [],
  submissions: [],
  loading: true,
  error: null,
  refreshAll: async () => {},
  refreshCompetition: async () => {},
  refreshRegistration: async () => {},
  refreshRoutes: async () => {},
  refreshSubmissions: async () => {},
  updateRegistration: async () => {},
  updateSubmissions: async () => {},
});

export function ClimberCompetitionProvider({ id, children }: { id?: number, children: ReactNode }) {
  const [competition, setCompetition] = useState<CompetitionSummary | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [submissions, setSubmissions] = useState<SubmittedRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);


  async function refreshAll(gymId: number, competitionId: number) {
    const targetId = id ?? competitionId;
    if (!targetId || !gymId) return;
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        refreshCompetition(gymId, targetId),
        refreshRegistration(gymId, targetId),
        refreshRoutes(gymId, targetId),
        refreshSubmissions(gymId, targetId),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  async function refreshCompetition(gymId: number, competitionId: number) {
    const targetId = id ?? competitionId;
    if (!targetId || !gymId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await getCompetition(gymId, targetId);
      setCompetition(data);
    } catch (err) {
      console.warn('Could not fetch competition info', err);
      setCompetition(null);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshRegistration(gymId: number, competitionId: number) {
    const targetId = id ?? competitionId;
    if (!targetId || !gymId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await getMyRegistrationForComp(gymId, targetId);
      setRegistration(data);
    } catch (err) {
      console.warn('Could not fetch registration info', err);
      setRegistration(null);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshRoutes(gymId: number, competitionId: number) {
    const targetId = id ?? competitionId;
    if (!targetId || !gymId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getRoutesForComp(gymId, targetId);
      const data: Route[] = res.map((r: any) => ({
        id: r.id,
        number: r.number,
        pointValue: r.pointValue,
      }));
      setRoutes(data);
    } catch (err) {
      console.warn('Could not fetch route info', err);
      setRoutes([]);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshSubmissions(
    gymId: number,
    competitionId: number
  ): Promise<void>  {
    const targetId = id ?? competitionId;
    if (!targetId || !gymId) return;
    setError(null);
    try {
      const res = await getMySubmissionsForComp(gymId, targetId);
      const data = res.map((r: any) => ({
        routeId: r.routeId,
        attempts: r.attempts,
        send: r.send,
      }));
      setSubmissions(data)
    } catch (err: any) {
      if (err?.status === 404) {
        // No submissions yet → treat as empty, not error
        return;
      }
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.warn('Could not fetch climber submissions:', err);
      throw err;
    }
  }

  async function updateRegistration(
    gymId: number, 
    competitionId: number, 
    data: CompRegistrationRequestDto
  ): Promise<void> {
    const targetId = id ?? competitionId;
    if (!targetId || !gymId) return;
    try {
      const res = await updateMyRegistrationForComp(gymId, targetId, data);
      const regData = {
        climberName: res.climberName,
        email: res.email,
        division: res.division,
        competitorGroup: res.competitorGroup
      } as Registration
      setRegistration(regData);
    } catch (err) {
      console.warn('Could not register climber', err);
      setError(err as Error);
      return;
    }
  }

  async function updateSubmissions(
    gymId: number, 
    competitionId: number, 
    data: SubmissionRequestDto
  ): Promise<void> {
    const targetId = id ?? competitionId;
    if (!targetId || !gymId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await submitScoresForComp(gymId, targetId, data);
      setSubmissions(res.routes as SubmittedRoute[]);
    } catch (err) {
      console.warn('Could not register climber', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id || !competition) return;
    refreshAll(competition?.gymId, id);
  }, [id]);

  if (!id) {
    // Optional: return early or provide empty context if no id given
    return <>{children}</>
  }

  return (
    <ClimberCompetitionContext.Provider value={{ 
      competition, 
      registration, 
      routes,
      submissions, 
      loading, 
      error,
      refreshAll, 
      refreshCompetition, 
      refreshRegistration,
      refreshRoutes,
      refreshSubmissions,
      updateRegistration,
      updateSubmissions 
    }}>
      {children}
    </ClimberCompetitionContext.Provider>
  )
}

export const useClimberCompetition = (): ClimberCompetitionContextType => {
  const context = useContext(ClimberCompetitionContext);
  if (!context) {
    throw new Error('useClimberCompetition must be used within ClimberCompetitionProvider');
  }
  return context;
}

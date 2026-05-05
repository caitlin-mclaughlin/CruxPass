// context/CompetitionContext
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { CompetitionEntity, HeatData, Registration, Route, SubmittedRoute } from '@/models/domain'
import { getCompetition, getMySubmissionsForComp, getMyRegistrationForComp, getRoutesForComp, submitScoresForComp, updateMyRegistrationForComp } from '@/services/climberCompetitionService';
import { CompRegistrationRequestDto, SubmissionRequestDto } from '@/models/dtos';

interface ClimberCompetitionContextType {
  competition: CompetitionEntity | null;
  registration: Registration | null;
  routes: Route[];
  submissions: SubmittedRoute[];
  climberCompLoading: boolean;
  error: Error | null;
  refreshAll: (compId: number) => Promise<void>;
  refreshCompetition: (compId: number) => Promise<void>;
  refreshRegistration: (compId: number) => Promise<void>;
  refreshRoutes: (compId: number) => Promise<void>;
  refreshSubmissions: (compId: number) => Promise<void>;
  setSubmissions: React.Dispatch<React.SetStateAction<SubmittedRoute[]>>; 
  updateRegistration: (compId: number, data: CompRegistrationRequestDto) => Promise<void>;
  updateSubmissions: (compId: number, data: SubmissionRequestDto) => Promise<void>;
}

const ClimberCompetitionContext = createContext<ClimberCompetitionContextType>({
  competition: null,
  registration: null,
  routes: [],
  submissions: [],
  climberCompLoading: true,
  error: null,
  refreshAll: async () => {},
  refreshCompetition: async () => {},
  refreshRegistration: async () => {},
  refreshRoutes: async () => {},
  refreshSubmissions: async () => {},
  setSubmissions: () => {},
  updateRegistration: async () => {},
  updateSubmissions: async () => {},
});

export function ClimberCompetitionProvider({ id, children }: { id?: number, children: ReactNode }) {
  const [competition, setCompetition] = useState<CompetitionEntity | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [submissions, setSubmissions] = useState<SubmittedRoute[]>([]);
  const [climberCompLoading, setclimberCompLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function refreshAll(compId: number) {
    const targetId = id ?? compId;
    if (!targetId) return;
    setError(prev => (prev ? null : prev));
    try {
      await Promise.all([
        refreshCompetition(targetId),
        refreshRegistration(targetId),
        refreshRoutes(targetId),
        refreshSubmissions(targetId),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }

  async function refreshCompetition(compId: number) {
    const targetId = id ?? compId;
    if (!targetId) return;
    setclimberCompLoading(true);
    setError(prev => (prev ? null : prev));
    try {
      const { data } = await getCompetition(targetId);
      setCompetition(data);
    } catch (err) {
      console.warn('Could not fetch competition info', err);
      setCompetition(null);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setclimberCompLoading(false);
    }
  }

  async function refreshRegistration(compId: number) {
    const targetId = id ?? compId;
    if (!targetId) return;
    setError(prev => (prev ? null : prev));
    try {
      const { data } = await getMyRegistrationForComp(targetId);
      setRegistration(data);
    } catch (err) {
      console.warn('Could not fetch registration info', err);
      setRegistration(null);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }

  async function refreshRoutes(compId: number) {
    const targetId = id ?? compId;
    if (!targetId) return;
    setError(prev => (prev ? null : prev));
    try {
      const res = await getRoutesForComp(targetId);
      const data: Route[] = res.map((r: any) => ({
        id: r.id,
        number: r.number,
        pointValue: r.pointValue,
      }));
      setRoutes(data);
    } catch (err) {
      console.warn('Could not fetch route info', err);
      setRoutes([]);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }

  async function refreshSubmissions(compId: number): Promise<void>  {
    const targetId = id ?? compId;
    if (!targetId) return;
    setError(prev => (prev ? null : prev));
    try {
      const res = await getMySubmissionsForComp(targetId);
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

  async function updateRegistration(compId: number, data: CompRegistrationRequestDto): Promise<void> {
    const targetId = id ?? compId;
    if (!targetId) return;
    try {
      const res = await updateMyRegistrationForComp(targetId, data);
      const regData = {
        climberName: res.climberName,
        climberDob: res.climberDob,
        division: res.division,
        competitorGroup: res.competitorGroup,
        heat: res.heat as HeatData,
        feeamount: res.feeamount,
        feeCurrency: res.feeCurrency,
      } as Registration
      setRegistration(regData);
    } catch (err) {
      console.warn('Could not register climber', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return;
    }
  }

  async function updateSubmissions(compId: number, data: SubmissionRequestDto): Promise<void> {
    const targetId = id ?? compId;
    if (!targetId) return;
    setError(prev => (prev ? null : prev));
    try {
      const res = await submitScoresForComp(targetId, data);
      setSubmissions(res.routes as SubmittedRoute[]);
    } catch (err) {
      console.warn('Could not register climber', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }

  useEffect(() => {
    if (!id || !competition) return;
    refreshAll(id);
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
      climberCompLoading, 
      error,
      refreshAll, 
      refreshCompetition, 
      refreshRegistration,
      refreshRoutes,
      refreshSubmissions,
      setSubmissions,
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

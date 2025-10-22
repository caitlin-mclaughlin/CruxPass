// context/CompetitionContext
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { CompetitionSummary, GymRegistration, Registration, Route, SubmittedRoute } from '@/models/domain'
import { getCompetition, getRegistrationsForComp, getRoutesForComp, getSubmissionsForComp, updateCompetitionInfo, updateRegistrationsForComp, updateRoutesForComp } from '@/services/gymCompetitionService';
import { CompetitionFormPayload, CompRegistrationRequestDto, CompRegistrationResponseDto, RouteDto, RouteResponseDto, SubmissionRequestDto } from '@/models/dtos';

interface GymCompetitionContextType {
  competition: CompetitionSummary | null;
  registrations: GymRegistration[] | null;
  routes: Route[] | null;
  submissions: SubmittedRoute[] | null;
  loading: boolean;
  error: Error | null;
  refreshAll: (gymId: number, competitionId: number) => Promise<void>;
  refreshCompetition: (gymId: number, competitionId: number) => Promise<void>;
  refreshRegistrations: (gymId: number, competitionId: number) => Promise<void>;
  refreshRoutes: (gymId: number, competitionId: number) => Promise<void>;
  refreshSubmissions: (gymId: number, competitionId: number) => Promise<void>;
//  setCompetitionFocus: (gymId: number, competitionId: number) => Promise<void>;
  updateCompetition: (gymId: number, competitionId: number, updatedData: CompetitionFormPayload) => Promise<void>;
  updateRegistrations: (gymId: number, competitionId: number, updatedData: Registration[]) => Promise<void>;
  updateRoutes: (gymId: number, competitionId: number, updatedData: RouteDto[]) => Promise<void>;
  //updateSubmissions: (updatedData: Partial<SubmittedRoute[]>) => Promise<void>;
}

const GymCompetitionContext = createContext<GymCompetitionContextType>({
  competition: null,
  registrations: [],
  routes: [],
  submissions: [],
  loading: true,
  error: null,
  refreshAll: async () => {},
  refreshCompetition: async () => {},
  refreshRegistrations: async () => {},
  refreshRoutes: async () => {},
  refreshSubmissions: async () => {},
//  setCompetitionFocus: async () => {},
  updateCompetition: async () => {},
  updateRegistrations: async () => {},
  updateRoutes: async () => {},
  //updateSubmissions: async () => {},
});

export function GymCompetitionProvider({ id, children }: { id?: number, children: ReactNode }) {
  const [competition, setCompetition] = useState<CompetitionSummary | null>(null);
  const [registrations, setRegistrations] = useState<GymRegistration[] | null>(null);
  const [routes, setRoutes] = useState<Route[] | null>(null);
  const [submissions, setSubmissions] = useState<SubmittedRoute[] | null>(null);
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
        refreshRegistrations(gymId, targetId),
        refreshRoutes(gymId, targetId),
        //refreshSubmissions(gymId, targetId),
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

  async function refreshRegistrations(gymId: number, competitionId: number) {
    const targetId = id ?? competitionId;
    if (!targetId || !gymId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getRegistrationsForComp(gymId, targetId);
      const data: GymRegistration[] = res.map((r: CompRegistrationResponseDto) => ({
        climberName: r.climberName,
        climberDob: r.climberDob,
        climberEmail: r.climberEmail,
        competitorGroup: r.competitorGroup,
        division: r.division,
        paid: r.paid,
      }));
      setRegistrations(data);
    } catch (err) {
      console.warn('Could not fetch registration info', err);
      setRegistrations(null);
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
      const data: Route[] = res.map((r: RouteResponseDto) => ({
        id: r.id,
        number: r.number,
        pointValue: r.pointValue,
      }));
      setRoutes(data);
    } catch (err) {
      console.warn('Could not fetch route info', err);
      setRoutes(null);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshSubmissions(gymId: number, competitionId: number) {
    const targetId = id ?? competitionId;
    if (!targetId || !gymId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getSubmissionsForComp(gymId, targetId);
      const data: SubmittedRoute[] = res.map((r: any) => ({
        routeId: r.routeId,
        attempts: r.attempts,
        send: r.send,
      }));
      setSubmissions(data);
    } catch (err) {
      console.warn('Could not fetch route info', err);
      setError(err as Error);
      setSubmissions(null);
    } finally {
      setLoading(false);
    }
  }

/*
  async function setCompetitionFocus(gymId: number, competitionId: number) {
    if (!competitionId || !gymId || competitionId === id) return null;
    setLoading(true);
    setError(null);
    try {
      const { data } = await getCompetition(gymId, competitionId);
      setCompetition(data);
      setCompetitionId(competitionId);
    } catch (err) {
      console.warn('Could not change competition focus', err);
      setCompetition(null);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }
*/

  async function updateCompetition(gymId: number, competitionId: number, updatedData: CompetitionFormPayload) {
    const targetId = id ?? competitionId;
    if (!targetId || !gymId) return;
    await updateCompetitionInfo(gymId, targetId, updatedData);
    await refreshCompetition(gymId, targetId);
  }

  async function updateRegistrations(gymId: number, competitionId: number, updatedData: Registration[]) {
    const targetId = id ?? competitionId;
    if (!targetId || !gymId) return;
    await updateRegistrationsForComp(gymId, targetId, updatedData);
    await refreshRegistrations(gymId, targetId);
  }

  async function updateRoutes(gymId: number, competitionId: number, updatedData: RouteDto[]) {
    const targetId = id ?? competitionId;
    if (!targetId || !gymId) return;
    await updateRoutesForComp(gymId, targetId, updatedData);
    await refreshRoutes(gymId, targetId);
  }
/*
  async function updateSubmissions(gymId: number, updatedData: Partial<SubmittedRoute[]>) {
    await updateSubmissions(id, updatedData);
    await refreshSubmissions(gymId, id);
  }
*/
  useEffect(() => {
    if (!id || !competition) return;
    refreshAll(competition?.gymId, id);
  }, [id]);

  if (!id) {
    // Optional: return early or provide empty context if no id given
    return <>{children}</>
  }

  return (
    <GymCompetitionContext.Provider value={{ 
      competition, 
      registrations,
      routes, 
      submissions,
      loading, 
      error,
      refreshAll, 
      refreshCompetition, 
      refreshRegistrations,
      refreshRoutes,
      refreshSubmissions,
//      setCompetitionFocus,
      updateCompetition,
      updateRegistrations,
      updateRoutes 
      //updateSubmissions 
      }}>
      {children}
    </GymCompetitionContext.Provider>
  )
}

export const useGymCompetition = (): GymCompetitionContextType => {
  const context = useContext(GymCompetitionContext);
  if (!context) {
    throw new Error('useGymCompetition must be used within GymCompetitionProvider');
  }
  return context;
}

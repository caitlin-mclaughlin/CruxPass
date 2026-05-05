// context/CompetitionContext
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { CompetitionEntity, GymRegistration, HeatData, Registration, Route, SubmittedRoute } from '@/models/domain'
import { getCompetition, getHeats, getRegistrationsForComp, getRoutesForComp, getSubmissionsForComp, updateCompetitionInfo, updateRegistrationsForComp, updateRoutesForComp } from '@/services/gymCompetitionService';
import { CompetitionDto, CompRegistrationRequestDto, CompRegistrationResponseDto, RouteDto, RouteResponseDto, SubmissionRequestDto, SubmissionResponseDto, SubmittedRouteDto, UpdateCompetitionDto } from '@/models/dtos';

interface GymCompetitionContextType {
  competition: CompetitionEntity | null;
  heats: HeatData[];
  registrations: GymRegistration[];
  routes: Route[] | null;
  submissions: SubmittedRoute[];
  gymCompLoading: boolean;
  error: Error | null;
  refreshAll: (compId: number) => Promise<void>;
  refreshCompetition: (compId: number) => Promise<void>;
  refreshHeats: (compId: number) => Promise<void>;
  refreshRegistrations: (compId: number) => Promise<void>;
  refreshRoutes: (compId: number) => Promise<void>;
  refreshSubmissions: (compId: number) => Promise<void>;
  updateCompetition: (compId: number, updatedData: UpdateCompetitionDto) => Promise<void>;
  updateRegistrations: (compId: number, updatedData: Registration[]) => Promise<void>;
  updateRoutes: (compId: number, updatedData: RouteDto[]) => Promise<void>;
  //updateSubmissions: (updatedData: Partial<SubmittedRoute[]>) => Promise<void>;
}

const GymCompetitionContext = createContext<GymCompetitionContextType>({
  competition: null,
  heats: [],
  registrations: [],
  routes: [],
  submissions: [],
  gymCompLoading: true,
  error: null,
  refreshAll: async () => {},
  refreshCompetition: async () => {},
  refreshHeats: async () => {},
  refreshRegistrations: async () => {},
  refreshRoutes: async () => {},
  refreshSubmissions: async () => {},
  updateCompetition: async () => {},
  updateRegistrations: async () => {},
  updateRoutes: async () => {},
  //updateSubmissions: async () => {},
});

export function GymCompetitionProvider({ id, children }: { id?: number, children: ReactNode }) {
  const [competition, setCompetition] = useState<CompetitionEntity | null>(null);
  const [heats, setHeats] = useState<HeatData[]>([]);
  const [registrations, setRegistrations] = useState<GymRegistration[]>([]);
  const [routes, setRoutes] = useState<Route[] | null>(null);
  const [submissions, setSubmissions] = useState<SubmittedRoute[]>([]);
  const [gymCompLoading, setGymCompLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function refreshAll(compId: number) {
    const targetId = id ?? compId;
    if (!targetId) return;
    setError(prev => (prev ? null : prev));
    try {
      await Promise.all([
        refreshCompetition(targetId),
        //refreshHeats(targetId),
        refreshRegistrations(targetId),
        //refreshRoutes(targetId),
        //refreshSubmissions(targetId),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }

  async function refreshCompetition(compId: number) {
    const targetId = id ?? compId;
    if (!targetId) return;
    setGymCompLoading(true);
    setError(prev => (prev ? null : prev));
    try {
      const data = await getCompetition(targetId);
      setCompetition(data as CompetitionEntity);
      setHeats(data.heats as HeatData[]);
    } catch (err) {
      console.warn('Could not fetch competition info', err);
      setCompetition(null);
      setError(err as Error);
    } finally {
      setGymCompLoading(false);
    }
  }
  
  async function refreshHeats(compId: number) {
    const targetId = id ?? compId;
    if (!targetId) return;
    setError(prev => (prev ? null : prev));
    try {
      const data = await getHeats(targetId);
      setHeats(data as HeatData[]);
      setCompetition(prev => prev && ({
         ...prev, 
         heats: data as HeatData[] 
      }));
    } catch (err) {
      console.warn('Could not fetch heat info', err);
      setHeats([]);
      setError(err as Error);
    }
  }

  async function refreshRegistrations(compId: number) {
    const targetId = id ?? compId;
    if (!targetId) return;
    setError(prev => (prev ? null : prev));
    try {
      const res = await getRegistrationsForComp(targetId);
      const data: GymRegistration[] = res.map((r: CompRegistrationResponseDto) => ({
        climberName: r.climberName,
        climberDob: r.climberDob,
        climberEmail: r.climberEmail,
        competitorGroup: r.competitorGroup,
        division: r.division,
        heat: r.heat as HeatData,
        feeamount: r.feeamount,
        feeCurrency: r.feeCurrency,
        paid: r.paid,
      }));
      setRegistrations(data);
    } catch (err) {
      console.warn('Could not fetch registration info', err);
      setRegistrations([]);
      setError(err as Error);
    }
  }

  async function refreshRoutes(compId: number) {
    const targetId = id ?? compId;
    if (!targetId) return;
    setError(prev => (prev ? null : prev));
    try {
      const res = await getRoutesForComp(targetId);
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
    }
  }

  async function refreshSubmissions(compId: number) {
    const targetId = id ?? compId;
    if (!targetId) return;
    setError(prev => (prev ? null : prev));
    try {
      const res = await getSubmissionsForComp(targetId);
      const data: SubmittedRoute[] = res.flatMap((submission: SubmissionResponseDto) =>
        (submission.routes ?? []).map((route: SubmittedRouteDto) => ({
          routeId: route.routeId,
          attempts: route.attempts,
          send: route.send,
        }))
      );
      setSubmissions(data);
    } catch (err) {
      console.warn('Could not fetch route info', err);
      setError(err as Error);
      setSubmissions([]);
    }
  }

  async function updateCompetition(compId: number, updatedData: UpdateCompetitionDto) {
    const targetId = id ?? compId;
    if (!targetId) return;
    await updateCompetitionInfo(targetId, updatedData);
    await refreshCompetition(targetId);
  }

  async function updateRegistrations(compId: number, updatedData: Registration[]) {
    const targetId = id ?? compId;
    if (!targetId) return;
    await updateRegistrationsForComp(targetId, updatedData);
    await refreshRegistrations(targetId);
  }

  async function updateRoutes(compId: number, updatedData: RouteDto[]) {
    const targetId = id ?? compId;
    if (!targetId) return;
    await updateRoutesForComp(targetId, updatedData);
    await refreshRoutes(targetId);
  }
/*
  async function updateSubmissions(gymId: number, updatedData: Partial<SubmittedRoute[]>) {
    await updateSubmissions(id, updatedData);
    await refreshSubmissions(gymId, id);
  }
*/
  useEffect(() => {
    if (!id || !competition) return;
    refreshAll(id);
  }, [id]);

  if (!id) {
    // Optional: return early or provide empty context if no id given
    return <>{children}</>
  }

  return (
    <GymCompetitionContext.Provider value={{ 
      competition, 
      heats,
      registrations,
      routes, 
      submissions,
      gymCompLoading, 
      error,
      refreshAll, 
      refreshCompetition, 
      refreshHeats, 
      refreshRegistrations,
      refreshRoutes,
      refreshSubmissions,
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

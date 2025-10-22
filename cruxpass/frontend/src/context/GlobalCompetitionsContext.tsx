// context/GlobalCompetitionsContext.tsx
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { CompetitionSummary, Registration, Route } from '@/models/domain';
import { getAllCompetitions, getRegistrationsForCompetition, getRoutesForCompetition } from '@/services/globalCompetitionService';
import { CompetitionSummaryDto, PublicRegistrationDto, RouteResponseDto } from '@/models/dtos';

interface GlobalCompetitionsContextValue {
  competitions: CompetitionSummary[];
  loading: boolean;
  error: Error | null;
  refreshCompetitions: () => Promise<void>;
  getRegistrationsForComp: (competitionId: number) => Promise<Registration[]>;
  getRoutesForComp: (competitionId: number) => Promise<Route[]>;
}

const GlobalCompetitionsContext = createContext<GlobalCompetitionsContextValue>({
  competitions: [],
  loading: true,
  error: null,
  refreshCompetitions: async () => {},
  getRegistrationsForComp: async () => [],
  getRoutesForComp: async () => []
});

export function GlobalCompetitionsProvider({ children }: { children: ReactNode }) {
  const [competitions, setCompetitions] = useState<CompetitionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // stable function - no deps
  const refreshCompetitions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllCompetitions();
      const data: CompetitionSummary[] = res.map((c: CompetitionSummaryDto) => ({
        id: c.id,
        gymId: c.gymId,
        name: c.name,
        date: c.date,
        duration: c.duration,
        deadline: c.deadline,
        capacity: c.capacity,
        types: c.types,
        compFormat: c.compFormat,
        competitorGroups: c.competitorGroups,
        divisions: c.divisions,
        divisionsEnabled: c.divisionsEnabled,
        compStatus: c.compStatus,
        location: c.location,
        hostGymName: c.hostGymName,
        registered: c.registered,
        registration: c.registration
      }));
      setCompetitions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  const getRegistrationsForComp = useCallback(async (competitionId: number): Promise<Registration[]> => {
    if (!competitionId) return [];
    try {
      const res =  await getRegistrationsForCompetition(competitionId);
      const data: Registration[] = res.map((r: PublicRegistrationDto) => ({
        climberName: r.climberName,
        climberDob: r.climberDob,
        division: r.division,
        competitorGroup: r.competitorGroup,
      }));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return [];
    }
  }, []);

  const getRoutesForComp = useCallback(async (competitionId: number): Promise<Route[]> => {
    if (!competitionId) return [];
    try {
      const res =  await getRoutesForCompetition(competitionId);
      const data: Route[] = res.map((r: RouteResponseDto) => ({
        id: r.id,
        number: r.number,
        pointValue: r.pointValue,
      }));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return [];
    }
  }, []);

  // run refresh once on mount
  useEffect(() => {
    refreshCompetitions();
  }, []);

  return (
    <GlobalCompetitionsContext.Provider value={{
      competitions,
      loading,
      error,
      refreshCompetitions,
      getRegistrationsForComp,
      getRoutesForComp
    }}>
      {children}
    </GlobalCompetitionsContext.Provider>
  );
}

export const useGlobalCompetitions = () => {
  const context = useContext(GlobalCompetitionsContext);
  if (!context) throw new Error('useCompetitions must be used within GlobalCompetitionsProvider');
  return context;
}

// context/GlobalCompetitionsContext
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CompetitionSummary, Registration, Route } from '@/models/domain';
import { getAllCompetitions, getRegistrationsForCompetition, getRoutesForCompetition } from '@/services/globalCompetitionService';

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

  useEffect(() => {
    refreshCompetitions();
  }, []);

  async function refreshCompetitions() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getAllCompetitions();
      setCompetitions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  async function getRegistrationsForComp(competitionId: number): Promise<Registration[]> {
    if (competitionId) {
      setLoading(true);
      setError(null);
      try {
        const res = await getRegistrationsForCompetition(competitionId);
        return res;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }
    return [];
  }

  async function getRoutesForComp(competitionId: number): Promise<Route[]> {
    if (competitionId) {
      setLoading(true);
      setError(null);
      try {
        const res = await getRoutesForCompetition(competitionId);
        return res;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }
    return [];
  }

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


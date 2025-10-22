// context/GlobalSeriesContext.tsx
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { SeriesData, Registration, Route, PublicSeries } from '@/models/domain';
import { getAllSeries} from '@/services/globalSeriesService';
import { PublicSeriesDto, SeriesDto } from '@/models/dtos';

interface GlobalSeriesContextValue {
  globalSeries: PublicSeries[];
  loading: boolean;
  error: Error | null;
  refreshSeries: () => Promise<void>;
//  getRegistrationsForComp: (seriesId: number) => Promise<Registration[]>;
//  getRoutesForComp: (seriesId: number) => Promise<Route[]>;
}

const GlobalSeriesContext = createContext<GlobalSeriesContextValue>({
  globalSeries: [],
  loading: true,
  error: null,
  refreshSeries: async () => {}
//  getRegistrationsForComp: async () => [],
//  getRoutesForComp: async () => []
});

export function GlobalSeriesProvider({ children }: { children: ReactNode }) {
  const [globalSeries, setSeries] = useState<PublicSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // stable function - no deps
  const refreshSeries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllSeries();
      const data: PublicSeries[] = res.map((s: PublicSeriesDto) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        description: s.description,
        startDate: s.startDate,
        endDate: s.endDate,
        deadline: s.deadline,
        seriesStatus: s.seriesStatus,
        registered: s.registered,
        seriesRegistration: s.seriesRegistration
      }))
      setSeries(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);
/*
  const getRegistrationsForComp = useCallback(async (seriesId: number): Promise<Registration[]> => {
    if (!seriesId) return [];
    try {
      const res =  await getRegistrationsForSeries(seriesId);
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

  const getRoutesForComp = useCallback(async (seriesId: number): Promise<Route[]> => {
    if (!seriesId) return [];
    try {
      const res =  await getRoutesForSeries(seriesId);
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
*/
  // run refresh once on mount
  useEffect(() => {
    refreshSeries();
  }, []);

  return (
    <GlobalSeriesContext.Provider value={{
      globalSeries,
      loading,
      error,
      refreshSeries,
//      getRegistrationsForComp,
//      getRoutesForComp
    }}>
      {children}
    </GlobalSeriesContext.Provider>
  );
}

export const useGlobalSeries = () => {
  const context = useContext(GlobalSeriesContext);
  if (!context) throw new Error('useSeries must be used within GlobalSeriesProvider');
  return context;
}

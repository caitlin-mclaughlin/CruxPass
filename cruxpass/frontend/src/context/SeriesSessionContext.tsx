// context/SeriesSessionContext.tsx
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { SimpleCompetitionData, SeriesData, SimpleGym, CompetitionEntity, SimpleCompetition, CompetitorGroupData } from "@/models/domain";
import { AccountType } from "@/constants/enum";
import { addCompetitionToSeries, addGymToSeries, createCompetitorGroup, getCompetitorGroups, getCompsForSeries, getGymsForSeries, getSeriesProfile, updateCompetitorGroup, updateSeries } from "@/services/seriesService"; 
import { CompetitorGroupDto, CreateCompetitorGroupDto, SimpleCompetitionDto, SimpleGymDto } from "@/models/dtos";
import { formatAddress } from "@/utils/formatters";

interface SeriesSessionContextType {
  series: SeriesData | null;
  gyms: SimpleGym[];
  competitions: SimpleCompetition[];
  seriesCustomGroups: CompetitorGroupData[];
  error: Error | null;
  seriesSessionLoading: boolean;
  refreshAll: () => Promise<void>;
  refreshSeries: () => Promise<void>;
  refreshGyms: () => Promise<void>;
  refreshCompetitions: () => Promise<void>;
  updateSeriesProfile: (updatedData: Partial<SeriesData>) => Promise<void>;
  addCompetition: (competitionId: number) => Promise<void>;
  addGym: (gymId: number) => Promise<void>;
  createCompetitorGroupForSeries: (data: CreateCompetitorGroupDto) => Promise<void>;
  updateCompetitorGroupForSeries: (data: CompetitorGroupDto) => Promise<void>;
}

const SeriesSessionContext = createContext<SeriesSessionContextType>({
  series: null,
  gyms: [],
  competitions: [],
  seriesCustomGroups: [],
  error: null,
  seriesSessionLoading: false,
  refreshAll: async () => {},
  refreshSeries: async () => {},
  refreshGyms: async () => {},
  refreshCompetitions: async () => {},
  updateSeriesProfile: async () => {},
  addCompetition: async () => {},
  addGym: async () => {},
  createCompetitorGroupForSeries: async() => {},
  updateCompetitorGroupForSeries: async() => {},
});

export function SeriesSessionProvider({ children }: { children: ReactNode }) {
  const { accountType, logout, token } = useAuth();
  const [series, setSeries] = useState<SeriesData | null>(null);
  const [competitions, setCompetitions] = useState<SimpleCompetition[]>([]);
  const [seriesCustomGroups, setSeriesCustomGroups] = useState<CompetitorGroupData[]>([]);
  const [gyms, setGyms] = useState<SimpleGym[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [seriesSessionLoading, setSeriesSessionLoading] = useState<boolean>(false);

  useEffect(() => {
    if (accountType !== AccountType.SERIES || !token) return;
    refreshAll();
  }, [accountType, token]);
  
  async function refreshAll() {
    await refreshSeries();
    await refreshGyms();
    await refreshCompetitions();
    await refreshSeriesCustomGroups();
  }

  async function refreshSeries() {
    setError(prev => (prev ? null : prev));
    setSeriesSessionLoading(true);
    if (accountType === AccountType.SERIES && token) {
      try {
        const res = await getSeriesProfile();
        setSeries(res as SeriesData);
      } catch (err) {
        logout()
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not fetch series info:', err);
      } finally {
        setSeriesSessionLoading(false);
      }
    }
  }

   async function refreshGyms() {
    setError(prev => (prev ? null : prev));
    if (accountType === AccountType.SERIES && token) {
      try {
        const res = await getGymsForSeries();
        const data = res.map((g: SimpleGymDto): SimpleGym => ({ ...g }));
        setGyms(data);
      } catch (err) {
        logout()
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not fetch series info:', err);
      }
    }
  }

   async function refreshCompetitions() {
    setError(prev => (prev ? null : prev));
    if (accountType === AccountType.SERIES && token) {
      try {
        const res = await getCompsForSeries();
        const data = res.map((c: SimpleCompetitionDto): SimpleCompetition => ({ ...c }));
        setCompetitions(data);
      } catch (err) {
        logout()
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not fetch series info:', err);
      }
    }
  }
  
    async function refreshSeriesCustomGroups() {
      setError(prev => (prev ? null : prev));
      if (accountType === AccountType.SERIES && token && series) {
        try {
          const res = await getCompetitorGroups();
          setSeriesCustomGroups(res as CompetitorGroupData[]);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          console.warn('Could not fetch competitor groups for series:', err);
        }
      }
    }

  async function updateSeriesProfile(updatedData: Partial<SeriesData>) {
    setError(prev => (prev ? null : prev));
    if (accountType === AccountType.SERIES && token) {
      try {
        await updateSeries(updatedData);
        await refreshSeries();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not update series info:', err);
      }
    }
  }

  async function addCompetition(competitionId: number) {
    setError(prev => (prev ? null : prev));
    if (accountType === AccountType.SERIES && token && series?.id) {
      try {
        const res = await addCompetitionToSeries(competitionId);
        refreshCompetitions();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not add gym to series:', err);
      }
    }
  }

  async function addGym(gymId: number) {
    setError(prev => (prev ? null : prev));
    if (accountType === AccountType.SERIES && token && series?.id) {
      try {
        const res = await addGymToSeries(gymId);
        refreshGyms();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not add competition:', err);
      }
    }
  }
  
  async function createCompetitorGroupForSeries(data: CreateCompetitorGroupDto) {
    setError(prev => (prev ? null : prev));
    if (accountType === AccountType.SERIES && token && series) {
      try {
        await createCompetitorGroup(data);
        refreshSeriesCustomGroups();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not create competitor group for series:', err);
      }
    }
  }
  
  async function updateCompetitorGroupForSeries(data: CompetitorGroupDto) {
    setError(prev => (prev ? null : prev));
    if (accountType === AccountType.SERIES && token && series) {
      try {
        await updateCompetitorGroup(data.id, data);
        refreshSeriesCustomGroups();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not create competitor group for series:', err);
      }
    }
  }

  return (
    <SeriesSessionContext.Provider value={{ 
      series,
      gyms,
      competitions,
      seriesCustomGroups,
      error,
      seriesSessionLoading,
      refreshAll,
      refreshSeries,
      refreshGyms,
      refreshCompetitions,
      updateSeriesProfile,
      addCompetition,
      addGym,
      createCompetitorGroupForSeries,
      updateCompetitorGroupForSeries
    }}>
      {children}
    </SeriesSessionContext.Provider>
  );
}

export function useSeriesSession() {
  return useContext(SeriesSessionContext);
}

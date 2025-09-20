// context/SeriesSessionContext.tsx
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { CompetitionData, SeriesData, Registration } from "@/models/domain";
import { AccountType } from "@/constants/enum";
import { addCompetitionToSeries, getSeriesProfile, updateSeries } from "@/services/seriesService"; 
import { CompetitionFormPayload } from "@/models/dtos";
import { formatAddress } from "@/utils/formatters";

interface SeriesSessionContextType {
  series: SeriesData | null;
  error: Error | null;
  refreshSeries: () => Promise<void>;
  updateSeriesProfile: (updatedData: Partial<SeriesData>) => Promise<void>;
  addCompetition: (updatedData: CompetitionFormPayload) => Promise<void>;
}

const SeriesSessionContext = createContext<SeriesSessionContextType>({
  series: null,
  error: null,
  refreshSeries: async () => {},
  updateSeriesProfile: async () => {},
  addCompetition: async () => {}
});

export function SeriesSessionProvider({ children }: { children: ReactNode }) {
  const { accountType, logout, token } = useAuth();
  const [series, setSeries] = useState<SeriesData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (accountType !== AccountType.SERIES || !token) return;
    refreshSeries();
  }, [accountType, token]);
  
  async function refreshSeries() {
    setError(null);
    if (accountType === AccountType.SERIES && token) {
      try {
        const res = await getSeriesProfile();
        const data = {
          id: res.id, 
          name: res.name, 
          email: res.email,
          username: res.username,
          startDate: res.startDate,
          endDate: res.endDate,
          deadline: res.deadline,
          seriesStatus: res.seriesStatus,
          createdAt: res.createdAt
        }
        setSeries(data as SeriesData);
      } catch (err) {
        logout()
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not fetch series info:', err);
      }
    }
  }

  async function updateSeriesProfile(updatedData: Partial<SeriesData>) {
    setError(null);
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

  async function addCompetition(data: CompetitionFormPayload) {
    setError(null);
    if (accountType === AccountType.SERIES && token && series?.id) {
      try {
        await addCompetitionToSeries(series.id, data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not add competition:', err);
      }
    }
  }

  return (
    <SeriesSessionContext.Provider value={{ 
      series,
      error,
      refreshSeries,
      updateSeriesProfile,
      addCompetition
    }}>
      {children}
    </SeriesSessionContext.Provider>
  );
}

export function useSeriesSession() {
  return useContext(SeriesSessionContext);
}

// useGymLookup.ts
import { CompetitionEntity, SimpleGym } from "@/models/domain";
import { getGymProfile, getCompetitionsById, searchGymsByQuery } from "@/services/gymLookupService";
import { createContext, ReactNode, useContext, useState } from "react";

interface GymLookupContextType {
  gymResults: SimpleGym[];
  gymSearchLoading: boolean;
  searchGyms: (query: string) => Promise<void>;
  getGymDetails: (gymId: number) => Promise<SimpleGym | null>;
  getCompetitions: (gymId: number) => Promise<CompetitionEntity[]>;
  clearGymsSearch: () => Promise<void>;
}

export const GymLookupContext = createContext<GymLookupContextType>({
  gymResults: [],
  gymSearchLoading: false,
  searchGyms: async () => {},
  getGymDetails: async () => null,
  getCompetitions: async () => [],
  clearGymsSearch: async () => {}
});

export const GymLookupProvider = ({ children }: { children: ReactNode }) => {
  const [gymResults, setResults] = useState<SimpleGym[]>([]);
  const [gymSearchLoading, setGymSearchLoading] = useState(false);

  const clearGymsSearch = async () => {
    setResults([]);
    setGymSearchLoading(false);
  }

  const searchGyms = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setGymSearchLoading(true);
    try {
      const res = await searchGymsByQuery(query);
      setResults(res);
    } catch (err) {
      console.error("Failed to search gyms:", err);
      setResults([]);
    } finally {
      setGymSearchLoading(false);
    }
  };

  const getGymDetails = async (gymId: number): Promise<SimpleGym | null> => {
    try {
      return await getGymProfile(gymId);
    } catch (err) {
      console.error(`Failed to fetch gym ${gymId}`, err);
      return null;
    }
  };

  const getCompetitions = async (gymId: number): Promise<CompetitionEntity[]> => {
    return await getCompetitionsById(gymId);
  };

  return (
    <GymLookupContext.Provider value={{ 
      gymResults,
      gymSearchLoading,
      searchGyms,
      getGymDetails,
      getCompetitions,
      clearGymsSearch
    }}>
      {children}
    </GymLookupContext.Provider>
  );
};

export function useGymLookup() {
  return useContext(GymLookupContext);
}
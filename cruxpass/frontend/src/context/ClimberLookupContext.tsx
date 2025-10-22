// useClimberLookup.ts
import { ClimberData, DependentClimber, SimpleClimber } from "@/models/domain";
import { getClimberProfile, getDependentsById, searchClimbersByQuery } from "@/services/climberLookupService";
import { createContext, ReactNode, useContext, useState } from "react";

interface ClimberLookupContextType {
    results: SimpleClimber[];
    loading: boolean;
    searchClimbers: (query: string) => Promise<void>;
    getClimberDetails: (climberId: number) => Promise<SimpleClimber | null>;
    getDependents: (climberId: number) => Promise<DependentClimber[]>;
    clearSearch: () => Promise<void>;
}

export const ClimberLookupContext = createContext<ClimberLookupContextType>({
    results: [],
    loading: false,
    searchClimbers: async () => {},
    getClimberDetails: async () => null,
    getDependents: async () => [],
    clearSearch: async () => {}
});

export const ClimberLookupProvider = ({ children }: { children: ReactNode }) => {
  const [results, setResults] = useState<SimpleClimber[]>([]);
  const [loading, setLoading] = useState(false);

  const clearSearch = async () => {
    setResults([]);
    setLoading(false);
  }

  const searchClimbers = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await searchClimbersByQuery(query);
      setResults(res);
    } catch (err) {
      console.error("Failed to search climbers:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getClimberDetails = async (climberId: number): Promise<SimpleClimber | null> => {
    try {
      return await getClimberProfile(climberId);
    } catch (err) {
      console.error(`Failed to fetch climber ${climberId}`, err);
      return null;
    }
  };

  const getDependents = async (climberId: number): Promise<DependentClimber[]> => {
    return await getDependentsById(climberId);
  };

  return (
    <ClimberLookupContext.Provider value={{ results, loading, searchClimbers, getClimberDetails, getDependents, clearSearch }}>
      {children}
    </ClimberLookupContext.Provider>
  );
};

export function useClimberLookup() {
  return useContext(ClimberLookupContext);
}
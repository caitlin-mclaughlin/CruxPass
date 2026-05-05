// useClimberLookup.ts
import { ClimberData, DependentClimber, SimpleClimber } from "@/models/domain";
import { getClimberProfile, getDependentsById, searchClimbersByQuery } from "@/services/climberLookupService";
import { createContext, ReactNode, useContext, useState } from "react";

interface ClimberLookupContextType {
    results: SimpleClimber[];
    climberSearchLoading: boolean;
    searchClimbers: (query: string) => Promise<void>;
    getClimberDetails: (climberId: number) => Promise<SimpleClimber | null>;
    getDependents: (climberId: number) => Promise<DependentClimber[]>;
    clearSearch: () => Promise<void>;
}

export const ClimberLookupContext = createContext<ClimberLookupContextType>({
    results: [],
    climberSearchLoading: false,
    searchClimbers: async () => {},
    getClimberDetails: async () => null,
    getDependents: async () => [],
    clearSearch: async () => {}
});

export const ClimberLookupProvider = ({ children }: { children: ReactNode }) => {
  const [results, setResults] = useState<SimpleClimber[]>([]);
  const [climberSearchLoading, setClimberSearchLoading] = useState(false);

  const clearSearch = async () => {
    setResults([]);
    setClimberSearchLoading(false);
  }

  const searchClimbers = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setClimberSearchLoading(true);
    try {
      const res = await searchClimbersByQuery(query);
      setResults(res);
    } catch (err) {
      console.error("Failed to search climbers:", err);
      setResults([]);
    } finally {
      setClimberSearchLoading(false);
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
    <ClimberLookupContext.Provider value={{ results, climberSearchLoading, searchClimbers, getClimberDetails, getDependents, clearSearch }}>
      {children}
    </ClimberLookupContext.Provider>
  );
};

export function useClimberLookup() {
  return useContext(ClimberLookupContext);
}
// context/GymSessionContext.tsx
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { CompetitionData, CompetitionSummary, GymData, Registration } from "@/models/domain";
import { AccountType } from "@/constants/enum";
import { createCompetitionForGym, getAllCompetitionsForGym, getGymProfile, updateGym } from "@/services/gymService";
import { CompetitionFormPayload } from "@/models/dtos";

interface GymSessionContextType {
  gym: GymData | null;
  error: Error | null;
  competitions: CompetitionSummary[];
  refreshGym: () => Promise<void>;
  refreshCompetitions: () => Promise<void>;
  updateGymProfile: (updatedData: Partial<GymData>) => Promise<void>;
  createCompetition: (updatedData: CompetitionFormPayload) => Promise<void>;
}

const GymSessionContext = createContext<GymSessionContextType>({
  gym: null,
  error: null,
  competitions: [],
  refreshGym: async () => {},
  refreshCompetitions: async () => {},
  updateGymProfile: async () => {},
  createCompetition: async () => {}
});

export function GymSessionProvider({ children }: { children: ReactNode }) {
  const { accountType, logout, token } = useAuth();
  const [gym, setGym] = useState<GymData | null>(null);
  const [competitions, setCompetitions] = useState<CompetitionSummary[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (accountType !== AccountType.GYM || !token) return;
    refreshGym();
    refreshCompetitions();
  }, [accountType, token]);
  
  async function refreshGym() {
    setError(null);
    if (accountType === AccountType.GYM && token) {
      try {
        const res = await getGymProfile();
        setGym(res as GymData);
      } catch (err) {
        logout()
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not fetch gym info:', err);
      }
    }
  }

  async function refreshCompetitions() {
    setError(null);
    if (accountType === AccountType.GYM && token && gym && gym.id) {
      try {
        const res = await getAllCompetitionsForGym(gym.id);
        setCompetitions(res as CompetitionSummary[]);
      } catch (err) {
        logout()
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not fetch competition info for gym:', err);
      }
    }
  }

  async function updateGymProfile(updatedData: Partial<GymData>) {
    setError(null);
    if (accountType === AccountType.GYM && token) {
      try {
        await updateGym(updatedData);
        await refreshGym();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not update gym info:', err);
      }
    }
  }

  async function createCompetition(data: CompetitionFormPayload) {
    setError(null);
    if (accountType === AccountType.GYM && token && gym) {
      try {
        await createCompetitionForGym(gym.id, data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not create competition:', err);
      }
    }
  }

  return (
    <GymSessionContext.Provider value={{ 
      gym,
      error,
      competitions,
      refreshGym,
      refreshCompetitions,
      updateGymProfile,
      createCompetition
    }}>
      {children}
    </GymSessionContext.Provider>
  );
}

export function useGymSession() {
  return useContext(GymSessionContext);
}

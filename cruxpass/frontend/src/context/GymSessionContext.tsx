// context/GymSessionContext.tsx
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { CompetitionData, GymData, Registration } from "@/models/domain";
import { AccountType } from "@/constants/enum";
import { createCompetitionForGym, getGymProfile, updateGym } from "@/services/gymService";
import { CompetitionFormPayload } from "@/models/dtos";
import { formatAddress } from "@/utils/formatters";

interface GymSessionContextType {
  gym: GymData | null;
  error: Error | null;
  refreshGym: () => Promise<void>;
  updateGymProfile: (updatedData: Partial<GymData>) => Promise<void>;
  createCompetition: (updatedData: CompetitionFormPayload) => Promise<void>;
}

const GymSessionContext = createContext<GymSessionContextType>({
  gym: null,
  error: null,
  refreshGym: async () => {},
  updateGymProfile: async () => {},
  createCompetition: async () => {}
});

export function GymSessionProvider({ children }: { children: ReactNode }) {
  const { accountType, logout, token } = useAuth();
  const [gym, setGym] = useState<GymData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (accountType !== AccountType.GYM || !token) return;
    refreshGym();
  }, [accountType, token]);
  
  async function refreshGym() {
    setError(null);
    if (accountType === AccountType.GYM && token) {
      try {
        const res = await getGymProfile();
        const data = {
          id: res.id, 
          name: res.name, 
          email: res.email,
          phone: res.phone,
          username: res.username,
          address: res.address,
          createdAt: res.createdAt
        }
        setGym(data as GymData);
      } catch (err) {
        logout()
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not fetch gym info:', err);
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
      refreshGym,
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

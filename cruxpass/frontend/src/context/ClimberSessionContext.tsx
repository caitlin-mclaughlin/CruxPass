// context/ClimberContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { ClimberData, SubmittedRoute } from '@/models/domain';
import { AccountType } from '@/constants/enum';
import { getClimberProfile, updateClimber } from '@/services/climberService';
import { SubmissionRequestDto } from '@/models/dtos';

interface ClimberSessionContextType {
  climber: ClimberData | null;
  error: Error | null;
  refreshClimber: () => Promise<void>;
  updateClimberProfile: (updatedData: Partial<ClimberData>) => Promise<void>;
}

const ClimberSessionContext = createContext<ClimberSessionContextType>({
  climber: null,
  error: null,
  refreshClimber: async () => {},
  updateClimberProfile: async () => {}
});

export function ClimberSessionProvider({ children }: { children: ReactNode }) {
  const { accountType, logout, token } = useAuth();
  const [climber, setClimber] = useState<ClimberData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (accountType !== AccountType.CLIMBER || !token) return;
    refreshClimber();
  }, [accountType, token]);

  async function refreshClimber() {
    setError(null);
    if (accountType === AccountType.CLIMBER && token) {
      try {
        const res = await getClimberProfile();
        const data = {
          id: res.id,
          name: res.name,
          email: res.email,
          phone: res.phone,
          username: res.username,
          dob: res.dob,
          division: res.division,
          address: res.address,
          createdAt: res.createdAt
        } as ClimberData
        setClimber(data);
      } catch (err) {
        logout()
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not fetch climber info:', err);
      }
    }
  }

  async function updateClimberProfile(updatedData: Partial<ClimberData>) {
    setError(null);
    if (accountType === AccountType.CLIMBER && token) {
      try {
        await updateClimber(updatedData);
        await refreshClimber();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not update climber info:', err);
      }
    }
  }

  return (
    <ClimberSessionContext.Provider value={{ 
      climber,
      error,
      refreshClimber,
      updateClimberProfile
    }}>
      {children}
    </ClimberSessionContext.Provider>
  );
}

export function useClimberSession() {
  return useContext(ClimberSessionContext);
}

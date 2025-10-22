// context/ClimberContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { ClimberData, DependentClimber } from '@/models/domain';
import { AccountType } from '@/constants/enum';
import { 
  getClimberProfile, 
  updateClimber, 
  getDependents, 
  addDependent, 
  updateDependent, 
  removeDependent 
} from '@/services/climberService';

interface ClimberSessionContextType {
  climber: ClimberData | null;
  dependents: DependentClimber[];
  error: Error | null;
  refreshAll: () => Promise<void>;
  refreshClimber: () => Promise<void>;
  refreshDependents: () => Promise<void>;
  updateClimberProfile: (updatedData: Partial<ClimberData>) => Promise<void>;
  addDependentProfile: (data: DependentClimber) => Promise<void>;
  updateDependentProfile: (id: number, data: Partial<DependentClimber>) => Promise<void>;
  removeDependentProfile: (id: number) => Promise<void>;
}

const ClimberSessionContext = createContext<ClimberSessionContextType>({
  climber: null,
  dependents: [],
  error: null,
  refreshAll: async () => {},
  refreshClimber: async () => {},
  refreshDependents: async () => {},
  updateClimberProfile: async () => {},
  addDependentProfile: async () => {},
  updateDependentProfile: async () => {},
  removeDependentProfile: async () => {}
});

export function ClimberSessionProvider({ children }: { children: ReactNode }) {
  const { accountType, logout, token } = useAuth();
  const [climber, setClimber] = useState<ClimberData | null>(null);
  const [dependents, setDependents] = useState<DependentClimber[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (accountType !== AccountType.CLIMBER || !token) return;
    refreshClimber();
    refreshDependents();
  }, [accountType, token]);

  async function refreshClimber() {
    setError(null);
    if (accountType === AccountType.CLIMBER && token) {
      try {
        const res = await getClimberProfile();
        setClimber(res as ClimberData);
      } catch (err) {
        logout();
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not fetch climber info:', err);
      }
    }
  }
  
  async function refreshAll() {
    await refreshClimber();
    await refreshDependents();
  }

  async function refreshDependents() {
    setError(null);
    if (accountType === AccountType.CLIMBER && token) {
      try {
        const res = await getDependents();
        setDependents(res as ClimberData[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not fetch dependents:', err);
      }
    }
  }

  async function updateClimberProfile(updatedData: Partial<ClimberData>) {
    setError(null);
    try {
      await updateClimber(updatedData);
      await refreshClimber();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.warn('Could not update climber info:', err);
    }
  }

  async function addDependentProfile(data: DependentClimber) {
    await addDependent(data);
    await refreshDependents();
  }

  async function updateDependentProfile(id: number, data: Partial<DependentClimber>) {
    await updateDependent(id, data);
    await refreshDependents();
  }

  async function removeDependentProfile(id: number) {
    await removeDependent(id);
    await refreshDependents();
  }

  return (
    <ClimberSessionContext.Provider value={{ 
      climber,
      dependents,
      error,
      refreshAll,
      refreshClimber,
      refreshDependents,
      updateClimberProfile,
      addDependentProfile,
      updateDependentProfile,
      removeDependentProfile
    }}>
      {children}
    </ClimberSessionContext.Provider>
  );
}

export function useClimberSession() {
  return useContext(ClimberSessionContext);
}

// context/GymSessionContext.tsx
import { createContext, useState, useContext, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { CompetitionEntity, CompetitorGroupData, GymData, SimpleSeries } from "@/models/domain";
import { AccountType } from "@/constants/enum";
import { addSeriesToGym, applyGroupMutations, createCompetitionForGym, createCompetitorGroup, deleteCompetitorGroup, getCompById, getCompetitionsForGym, getCompetitorGroups, getGymProfile, getSeriesForGym, updateCompetitionForGym, updateCompetitorGroup, updateGym } from "@/services/gymService";
import { CreateCompetitionDto, CompetitorGroupDto, CreateCompetitorGroupDto, CompetitionDto, UpdateCompetitionDto, ResolvedCompetitorGroup, GroupMutationsDto, CreatedGroupResult } from "@/models/dtos";

interface GymSessionContextType {
  gym: GymData | null;
  gymSessionLoading: boolean;
  error: Error | null;
  competitions: CompetitionEntity[];
  gymCustomGroups: ResolvedCompetitorGroup[];
  gymSeries: SimpleSeries[];
  refreshAll: () => Promise<void>;
  refreshGym: () => Promise<GymData | undefined>;
  refreshGymCustomGroups: () => Promise<void>;
  refreshCompetitions: () => Promise<void>;
  refreshSeries: () => Promise<void>;
  updateGymProfile: (data: Partial<GymData>) => Promise<void>;
  addSeries: (seriesId: number) => Promise<void>;
  getCompetitionById: (competitionId: number) => Promise<CompetitionEntity | null>;
  applyGroupMutationsForGym: (data: GroupMutationsDto) => Promise<CreatedGroupResult[]>;
  createCompetition: (data: CreateCompetitionDto) => Promise<number>;
  updateCompetition: (data: UpdateCompetitionDto) => Promise<void>;
  createCompetitorGroupForGym: (data: CreateCompetitorGroupDto) => Promise<CompetitorGroupData>;
  updateCompetitorGroupForGym: (data: CompetitorGroupDto) => Promise<CompetitorGroupData>;
  deleteCompetitorGroupForGym: (groupId: number) => Promise<void>;
}

const GymSessionContext = createContext<GymSessionContextType>({
  gym: null,
  gymSessionLoading: true,
  error: null,
  competitions: [],
  gymCustomGroups: [],
  gymSeries: [],
  refreshAll: async () => {},
  refreshGym: async () => undefined,
  refreshGymCustomGroups: async () => {},
  refreshCompetitions: async () => {},
  refreshSeries: async () => {},
  updateGymProfile: async () => {},
  addSeries: async () => {},
  getCompetitionById: async () => null,
  applyGroupMutationsForGym: async () => [],
  createCompetition: async () => {
    throw new Error("Competition could not be created");
  },
  updateCompetition: async () => {},
  createCompetitorGroupForGym: async() => {
    throw new Error("GymSessionContext not initialized");
  },
  updateCompetitorGroupForGym: async() => {
    throw new Error("GymSessionContext not initialized");
  },
  deleteCompetitorGroupForGym: async () => {},
});

export function GymSessionProvider({ children }: { children: ReactNode }) {
  const { accountType, logout, token } = useAuth();
  const [gym, setGym] = useState<GymData | null>(null);
  const [gymSessionLoading, setGymSessionLoading] = useState<boolean>(true);
  const [competitions, setCompetitions] = useState<CompetitionEntity[]>([]);
  const [gymCustomGroups, setGymCustomGroups] = useState<ResolvedCompetitorGroup[]>([]);
  const [gymSeries, setSeries] = useState<SimpleSeries[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (accountType !== AccountType.GYM || !token) return;
    refreshAll();
  }, [accountType, token]);

  async function refreshAll() {
    const syncGym = await refreshGym();
    await refreshCompetitions(syncGym?.id);
    await refreshSeries(syncGym?.id);
    await refreshGymCustomGroups(syncGym?.id);
  }
  
  async function refreshGym(): Promise<GymData | undefined> {
    setError(prev => (prev ? null : prev));
    setGymSessionLoading(true);
    if (accountType === AccountType.GYM && token) {
      try {
        const res = await getGymProfile();
        setGym(res as GymData);
        return res as GymData;
      } catch (err) {
        logout()
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not fetch gym info:', err);
      } finally {
        setGymSessionLoading(false);
      }
    } else {
      throw new Error("GymSessionContext not initialized");
    }
  }

  async function refreshCompetitions(gymId?: number) {
    setError(prev => (prev ? null : prev));
    if (accountType === AccountType.GYM && token && (gymId || gym)) {
      try {
        const res = await getCompetitionsForGym();
        setCompetitions(res as CompetitionEntity[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not fetch competition info for gym:', err);
      }
    } else {
      throw new Error("GymSessionContext not initialized");
    }
  }

  async function refreshSeries(gymId?: number) {
    setError(prev => (prev ? null : prev));
    if (accountType === AccountType.GYM && token && (gymId || gym)) {
      try {
        const res = await getSeriesForGym();
        setSeries(res as SimpleSeries[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not fetch competition info for gym:', err);
      }
    } else {
      throw new Error("GymSessionContext not initialized");
    }
  }

  async function refreshGymCustomGroups(gymId?: number) {
    setError(prev => (prev ? null : prev));
    if (accountType === AccountType.GYM && token && (gymId || gym)) {
      try {
        const res = await getCompetitorGroups();
        setGymCustomGroups(res as ResolvedCompetitorGroup[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not fetch competitor groups for gym:', err);
      }
    } else {
      throw new Error("GymSessionContext not initialized");
    }
  }

  async function updateGymProfile(data: Partial<GymData>) {
    setError(prev => (prev ? null : prev));
    if (accountType === AccountType.GYM && token) {
      try {
        await updateGym(data);
        await refreshGym();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not update gym info:', err);
      }
    } else {
      throw new Error("GymSessionContext not initialized");
    }
  }
  
  async function addSeries(seriesId: number) {
    setError(prev => (prev ? null : prev));
    if (accountType === AccountType.GYM && token && gym?.id) {
      try {
        const res = await addSeriesToGym(seriesId);
        refreshSeries();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not add gymSeries to gym:', err);
      }
    } else {
      throw new Error("GymSessionContext not initialized");
    }
  }

  const getCompetitionById = useCallback(
    async (competitionId: number): Promise<CompetitionEntity | null> => {
      if (accountType !== AccountType.GYM || !token || !gym) {
        return null;
      }
      setError(prev => (prev ? null : prev));
      try {
        const res = await getCompById(competitionId);
        return res as CompetitionEntity;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        console.warn("Could not get competition:", err);
        return null;
      } 
    },
    [accountType, token, gym?.id]
  );

  async function createCompetition(data: CreateCompetitionDto): Promise<number> {
    setError(prev => (prev ? null : prev));
    if (accountType === AccountType.GYM && token && gym) {
      try {
        const res = await createCompetitionForGym(data);
        refreshCompetitions();
        return res;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not create competition:', err);
        return -1;
      }
    } else {
      throw new Error("GymSessionContext not initialized");
    }
  }

  async function updateCompetition(data: UpdateCompetitionDto): Promise<void> {
    setError(prev => (prev ? null : prev));
    if (accountType === AccountType.GYM && token && gym) {
      try {
        await updateCompetitionForGym(data);
        refreshCompetitions();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not create competition:', err);
      }
    } else {
      throw new Error("GymSessionContext not initialized");
    }
  }

  async function createCompetitorGroupForGym(data: CreateCompetitorGroupDto): Promise<CompetitorGroupData> {
    setError(prev => (prev ? null : prev));
    console.log("logging gym" + gym);
    if (accountType === AccountType.GYM && token && gym) {
      try {
        const res = await createCompetitorGroup(data);
        refreshGymCustomGroups();
        return {
          ownerId: gym.id,
          clientId: `db-${res.id}`,
          constrained: res.ageRule ? true : false,
          ...res
        };
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not create competitor group for gym:', err);
        throw error;
      }
    } else {
      throw new Error("GymSessionContext not initialized");
    }
  }

  async function applyGroupMutationsForGym(data: GroupMutationsDto): Promise<CreatedGroupResult[]> {
    setError(prev => (prev ? null : prev));
    if (accountType === AccountType.GYM && token && gym) {
      try {
        const res = await applyGroupMutations(data);
        refreshGymCustomGroups();
        return res;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not create competitor group for gym:', err);
        throw error;
      }
    } else {
      throw new Error("GymSessionContext not initialized");
    }
  }

  async function updateCompetitorGroupForGym(data: CompetitorGroupDto): Promise<CompetitorGroupData>  {
    setError(prev => (prev ? null : prev));
    if (accountType === AccountType.GYM && token && gym) {
      try {
        const res = await updateCompetitorGroup(data.id, data);
        refreshGymCustomGroups();
        return {
          ownerId: gym.id,
          clientId: `db-${res.id}`,
          constrained: res.ageRule ? true : false,
          ...res
        };
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not create competitor group for gym:', err);
        throw error;
      }
    } else {
      throw new Error("GymSessionContext not initialized");
    }
  }

  async function deleteCompetitorGroupForGym(groupId: number): Promise<void>  {
    setError(prev => (prev ? null : prev));
    if (accountType === AccountType.GYM && token && gym) {
      try {
        await deleteCompetitorGroup(groupId);
        refreshGymCustomGroups();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.warn('Could not delete competitor group for gym:', err);
      }
    }
  }

  return (
    <GymSessionContext.Provider value={{ 
      gym,
      gymSessionLoading,
      error,
      competitions,
      gymCustomGroups,
      gymSeries,
      refreshAll,
      refreshGym,
      refreshGymCustomGroups,
      refreshCompetitions,
      refreshSeries,
      updateGymProfile,
      addSeries,
      getCompetitionById,
      applyGroupMutationsForGym,
      createCompetition,
      updateCompetition,
      createCompetitorGroupForGym,
      updateCompetitorGroupForGym,
      deleteCompetitorGroupForGym
    }}>
      {children}
    </GymSessionContext.Provider>
  );
}

export function useGymSession() {
  return useContext(GymSessionContext);
}

// context/GlobalCompetitionsContext.tsx
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { CompetitionEntity, HeatData, Registration, Route } from '@/models/domain';
import { getAllCompetitions, getRegistrationsForCompetition, getRoutesForCompetition } from '@/services/globalCompetitionService';
import { CompetitionDto, PublicRegistrationDto, RouteResponseDto } from '@/models/dtos';

interface GlobalCompetitionsContextValue {
  competitions: CompetitionEntity[];
  globalCompsLoading: boolean;
  error: Error | null;
  refreshCompetitions: () => Promise<void>;
  getRegistrationsForComp: (competitionId: number) => Promise<Registration[]>;
  getRoutesForComp: (competitionId: number) => Promise<Route[]>;
}

const GlobalCompetitionsContext = createContext<GlobalCompetitionsContextValue>({
  competitions: [],
  globalCompsLoading: true,
  error: null,
  refreshCompetitions: async () => {},
  getRegistrationsForComp: async () => [],
  getRoutesForComp: async () => []
});

export function GlobalCompetitionsProvider({ children }: { children: ReactNode }) {
  const [competitions, setCompetitions] = useState<CompetitionEntity[]>([]);
  const [globalCompsLoading, setGlobalCompsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // stable function - no deps
  const refreshCompetitions = useCallback(async () => {
    setGlobalCompsLoading(true);
    setError(prev => (prev ? null : prev));
    try {
      const res = await getAllCompetitions();
      const data: CompetitionEntity[] = res.map((c: CompetitionDto) => ({
        id: c.id,
        gymId: c.gymId,
        name: c.name,
        startDate: c.startDate,
        deadline: c.deadline,
        types: Array.isArray(c.types) ? c.types : [],
        compFormat: c.compFormat,
        pricingType: c.pricingType ?? 'FLAT',
        flatFee: c.flatFee ?? 0,
        feeCurrency: c.feeCurrency ?? 'USD',
        pricingRules: Array.isArray(c.pricingRules) ? c.pricingRules : [],
        selectedGroups: Array.isArray(c.selectedGroups) ? c.selectedGroups : [],
        heats: Array.isArray(c.heats) ? c.heats : [],
        compStatus: c.compStatus,
        location: c.location,
        hostGymName: c.hostGymName
      }));
      setCompetitions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setGlobalCompsLoading(false);
    }
  }, []);

  const getRegistrationsForComp = useCallback(async (competitionId: number): Promise<Registration[]> => {
    if (!competitionId) return [];
    try {
      const res =  await getRegistrationsForCompetition(competitionId);
      const data: Registration[] = res.map((r: PublicRegistrationDto) => ({
        climberName: r.climberName,
        climberDob: r.climberDob,
        division: r.division,
        competitorGroup: r.competitorGroup,
        heat: r.heat as HeatData,
        feeamount: r.feeamount,
        feeCurrency: r.feeCurrency,
      }));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return [];
    }
  }, []);

  const getRoutesForComp = useCallback(async (competitionId: number): Promise<Route[]> => {
    if (!competitionId) return [];
    try {
      const res =  await getRoutesForCompetition(competitionId);
      const data: Route[] = res.map((r: RouteResponseDto) => ({
        id: r.id,
        number: r.number,
        pointValue: r.pointValue,
      }));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return [];
    }
  }, []);

  // run refresh once on mount
  useEffect(() => {
    refreshCompetitions();
  }, []);

  return (
    <GlobalCompetitionsContext.Provider value={{
      competitions,
      globalCompsLoading,
      error,
      refreshCompetitions,
      getRegistrationsForComp,
      getRoutesForComp
    }}>
      {children}
    </GlobalCompetitionsContext.Provider>
  );
}

export const useGlobalCompetitions = () => {
  const context = useContext(GlobalCompetitionsContext);
  if (!context) throw new Error('useCompetitions must be used within GlobalCompetitionsProvider');
  return context;
}

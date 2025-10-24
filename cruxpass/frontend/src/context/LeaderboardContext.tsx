import { createContext, useState, useContext, useEffect, ReactNode, useCallback, useMemo } from "react";
import { Client } from "@stomp/stompjs";
import { CompetitionSummary, LiveScoreEvent, RankedSubmission, Registration } from "@/models/domain";
import { getCompetition, getScoresForComp } from "@/services/leaderboardService";
import { CompetitorGroup, Gender, GroupDivisionKey } from "@/constants/enum";
import { PublicRegistrationDto, RankedSubmissionDto } from "@/models/dtos";
import { getRegistrationsForCompetition } from "@/services/globalCompetitionService";
import { useLiveScores } from "@/context/LiveScoresContext";
import { useDebouncedCallback } from "use-debounce";

type ScoresByGroupDivision = Partial<Record<GroupDivisionKey, RankedSubmissionDto[]>>;

interface LeaderboardContextType {
  competition: CompetitionSummary | null;
  registrations: Registration[];
  scores: ScoresByGroupDivision;
  loading: boolean;
  error: Error | null;
  refreshCompetition: (competitionId: number) => Promise<void>;
  refreshRegistrations: (competitionId: number) => Promise<void>;
  updateGroupLeaderboard: (key: GroupDivisionKey, leaderboard: RankedSubmissionDto[]) => void;
}

const LeaderboardContext = createContext<LeaderboardContextType>({
  competition: null,
  registrations: [],
  scores: {},
  loading: true,
  error: null,
  refreshCompetition: async () => {},
  refreshRegistrations: async () => {},
  updateGroupLeaderboard: async () => {},
});

export function LeaderboardProvider({ id, children }: { id?: number; children: ReactNode }) {
  const [competition, setCompetition] = useState<CompetitionSummary | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [scores, setScores] = useState<ScoresByGroupDivision>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { liveEvents } = useLiveScores();
  
  const debouncedUpdate = useDebouncedCallback((latest: LiveScoreEvent) => {
    const key = `${latest.competitorGroup}-${latest.division}` as GroupDivisionKey;
    setScores(prev => {
      const groupScores = prev[key] ?? [];
      const updated = groupScores.map(entry =>
        entry.climberName === latest.climberName
          ? {
              ...entry,
              totalPoints: latest.totalPointsAfterUpdate,
              totalAttempts: latest.totalAttemptsAfterUpdate,
            }
          : entry
      );
      return { ...prev, [key]: updated };
    });
  }, 200);

  useEffect(() => {
    if (!competition || !liveEvents.length) return;
    const latest = liveEvents[liveEvents.length - 1];
    if (latest.competitionId !== competition.id) return;
    debouncedUpdate(latest);
  }, [liveEvents]);

  // ---------------------- Refresh helpers ----------------------
  const refreshCompetition = useCallback(async (competitionId: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getCompetition(competitionId);
      setCompetition(data);

      // 1. Build promises for all group/division fetches
      const scorePromises = data.competitorGroups.flatMap((group: CompetitorGroup) =>
        data.divisions.map(async (division: Gender) => {
          const res = await getScoresForComp(competitionId, group, division);
          const mapped: RankedSubmission[] = res.map((r: RankedSubmissionDto) => ({
            place: r.place,
            climberName: r.climberName,
            totalPoints: r.totalPoints,
            totalAttempts: r.totalAttempts,
            competitorGroup: r.competitorGroup,
            division: r.division,
          }));
          const key = `${group}-${division}` as GroupDivisionKey;
          return [key, mapped] as const;
        })
      );

      // 2. Wait for all of them to finish
      const results = await Promise.all(scorePromises);

      // 3. Normalize into object
      const initialScores: ScoresByGroupDivision = results.reduce(
        (acc, [key, mapped]) => {
          acc[key] = mapped;
          return acc;
        },
        {} as ScoresByGroupDivision
      );

      setScores(initialScores);
    } catch (err) {
      console.error("Could not fetch competition info", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRegistrations = useCallback(async (competitionId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRegistrationsForCompetition(competitionId);
      const data: Registration[] = res.map((r: PublicRegistrationDto) => ({
        climberName: r.climberName,
        climberDob: r.climberDob,
        competitorGroup: r.competitorGroup,
        division: r.division,
      }))
      setRegistrations(data);
    } catch (err) {
      console.error("Could not fetch registration info", err);
      setRegistrations([]);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------------------- Update leaderboard ----------------------
  const updateGroupLeaderboard = useCallback(
    (key: GroupDivisionKey, leaderboard: RankedSubmissionDto[]) => {
      setScores(prev => {
        const oldLeaderboard = prev[key] ?? [];

        // map climberName -> old place
        const oldPlaces = new Map(oldLeaderboard.map(r => [r.climberName, r.place]));

        // add movement info
        const enriched = leaderboard.map(r => {
          const prevPlace = oldPlaces.get(r.climberName);
          let movement: "up" | "down" | "same" = "same";
          if (prevPlace !== undefined) {
            if (r.place < prevPlace) movement = "up";
            else if (r.place > prevPlace) movement = "down";
          }
          return { ...r, movement };
        });

        return { ...prev, [key]: enriched };
      });
    },
    []
  );

  // ---------------------- WebSocket subscription ----------------------
  useEffect(() => {
    if (!id || !competition) return;

    const client = new Client({
      brokerURL: `ws://localhost:8080/ws`,
      reconnectDelay: 5000,
      debug: str => console.log("[STOMP]", str),
    });

    client.onConnect = () => {
      console.log("Connected to leaderboard WebSocket");

      competition.competitorGroups.forEach(group => {
        competition.divisions.forEach(division => {
          const topic = `/topic/leaderboard/${id}/${group}/${division}`;
          client.subscribe(topic, message => {
            try {
              const payload: { 
                group: CompetitorGroup; 
                division: Gender; 
                leaderboard: RankedSubmissionDto[] 
              } = JSON.parse(message.body);
              const key = `${payload.group}-${payload.division}` as GroupDivisionKey;
              console.log("WebSocket update:", {
                subscribedTopic: topic,
                key,
                payload,
              });
              updateGroupLeaderboard(key, payload.leaderboard);
            } catch (e) {
              console.error("Failed to parse leaderboard update", e);
            }
          });
        });
      });
    };

    client.onStompError = frame => {
      console.error("Broker error:", frame.headers["message"], frame.body);
    };

    client.activate();

    // --- CLEANUP ---
    return () => {
      void (async () => {
        await client.deactivate();
      })();
    };

  }, [id, competition, updateGroupLeaderboard]);

  // Initial load
  useEffect(() => {
    if (!id) return;
    refreshCompetition(id);
    refreshRegistrations(id);
  }, [id]);
  
  const contextValue = useMemo(() => ({
    competition,
    registrations,
    scores,
    loading,
    error,
    refreshCompetition,
    refreshRegistrations,
    updateGroupLeaderboard,
  }), [competition, registrations, scores, loading, error, refreshCompetition, refreshRegistrations, updateGroupLeaderboard]);

  return (
    <LeaderboardContext.Provider value={contextValue}>
      {children}
    </LeaderboardContext.Provider>
  );
}

export function useLeaderboard() {
  return useContext(LeaderboardContext);
}

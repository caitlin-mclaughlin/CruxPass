import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { Client } from "@stomp/stompjs";
import { LiveScoreEvent } from "@/models/domain";

interface LiveScoresContextType {
  liveEvents: LiveScoreEvent[];  // array form for UI
  addEvent: (event: LiveScoreEvent) => void;
  clearEvents: () => void;
}

const LiveScoresContext = createContext<LiveScoresContextType>({
  liveEvents: [],
  addEvent: () => {},
  clearEvents: () => {},
});

export function LiveScoresProvider({
  competitionId,
  children,
}: {
  competitionId?: number;
  children: ReactNode;
}) {
  const [eventsMap, setEventsMap] = useState<Map<number, LiveScoreEvent>>(new Map());

  // Only keep the most recent event per climber
  const addEvent = useCallback((event: LiveScoreEvent) => {
    setEventsMap((prev) => {
      const next = new Map(prev);
      next.set(event.climberId, event);
      return next;
    });
  }, []);

  const clearEvents = useCallback(() => setEventsMap(new Map()), []);

  // Convert Map to array for consumers
  const liveEvents = useMemo(() => Array.from(eventsMap.values()), [eventsMap]);

  // WebSocket connection
  useEffect(() => {
    if (!competitionId) return;

    const client = new Client({
      brokerURL: "ws://localhost:8080/ws",
      reconnectDelay: 5000,
      debug: (msg) => console.log("[LiveScores WS]", msg),
    });

    client.onConnect = () => {
      console.log("Connected to LiveScores WebSocket");
      const topic = `/topic/submissions/${competitionId}`;

      client.subscribe(topic, (message) => {
        try {
          const event: LiveScoreEvent = JSON.parse(message.body);
          addEvent(event);
        } catch (err) {
          console.error("Failed to parse live score event", err);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("LiveScores WS error:", frame.headers["message"], frame.body);
    };

    client.activate();

    return () => {
      void (async () => {
        await client.deactivate();
      })();
    };
  }, [competitionId, addEvent]);

  return (
    <LiveScoresContext.Provider value={{ liveEvents, addEvent, clearEvents }}>
      {children}
    </LiveScoresContext.Provider>
  );
}

export function useLiveScores() {
  return useContext(LiveScoresContext);
}

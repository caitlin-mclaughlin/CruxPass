import {
  DEFAULT_COMPETITOR_GROUPS,
  DefaultCompetitorGroup,
  DefaultCompetitorGroupMap,
  DIVISION_OPTIONS,
  Division,
} from "@/constants/enum";
import { CompetitionEntity, HeatData } from "@/models/domain";

function asDefaultGroup(value?: string | null): DefaultCompetitorGroup | null {
  if (!value) return null;

  if ((DEFAULT_COMPETITOR_GROUPS as readonly string[]).includes(value)) {
    return value as DefaultCompetitorGroup;
  }

  const mapped = (Object.entries(DefaultCompetitorGroupMap) as Array<[DefaultCompetitorGroup, string]>)
    .find(([, label]) => label === value)?.[0];
  return mapped ?? null;
}

export function getSummaryDefaultGroups(competition: CompetitionEntity): DefaultCompetitorGroup[] {
  const keys = new Set<DefaultCompetitorGroup>();

  (competition.selectedGroups ?? []).forEach(group => {
    const key = asDefaultGroup(group?.name);
    if (key) keys.add(key);
  });

  (competition.heats ?? []).forEach(heat => {
    (heat.groups ?? []).forEach(group => {
      const key = asDefaultGroup(group?.name);
      if (key) keys.add(key);
    });
  });

  return DEFAULT_COMPETITOR_GROUPS.filter(group => keys.has(group));
}

export function getSummaryDivisions(competition: CompetitionEntity): Division[] {
  const heats = Array.isArray(competition.heats) ? competition.heats : [];
  if (heats.length === 0) return [];

  if (heats.some(heat => !heat.divisionsEnabled)) {
    return [...DIVISION_OPTIONS];
  }

  const divisions = new Set<Division>();
  heats.forEach(heat => {
    (heat.divisions ?? []).forEach(division => divisions.add(division));
  });

  return DIVISION_OPTIONS.filter(division => divisions.has(division));
}

export function summarizeHeats(competition: CompetitionEntity): string[] {
  const heats = Array.isArray(competition.heats) ? competition.heats : [];
  if (heats.length === 0) return [];
  
  const parts: string[] = [`${heats.length} heat${heats.length === 1 ? "" : "s"}`];

  const durations = heats
    .map(h => h?.duration)
    .filter((duration): duration is number => typeof duration === "number" && duration > 0);
  if (durations.length > 0) {
    const uniqueDurations = [...new Set(durations)];
    parts.push(
      uniqueDurations.length === 1
        ? `${uniqueDurations[0]} min each`
        : `${Math.min(...uniqueDurations)}-${Math.max(...uniqueDurations)} min each`
    );
  }

  const capacities = heats
    .map(h => h?.capacity)
    .filter((capacity): capacity is number => typeof capacity === "number" && capacity > 0);
  const totalCapacity = capacities.reduce((sum, capacity) => sum + capacity, 0);
  if (totalCapacity > 0) {
    parts.push(`Total Capacity: ${totalCapacity}`);
  }

  return parts;
}

export function heatSupportsGroup(heat: HeatData, group: DefaultCompetitorGroup): boolean {
  return (heat.groups ?? []).some(g => {
    const key = asDefaultGroup(g?.name);
    return key === group;
  });
}

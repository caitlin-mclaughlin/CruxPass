import {
  DEFAULT_COMPETITOR_GROUPS,
  DefaultCompetitorGroup,
  DefaultCompetitorGroupMap,
  DIVISION_OPTIONS,
  Division,
  GroupDivisionKey,
} from "@/constants/enum";
import { CompetitionEntity, HeatData } from "@/models/domain";
import { getSummaryDefaultGroups, getSummaryDivisions } from "@/utils/competitionSummary";

export type LeaderboardSection = {
  key: GroupDivisionKey;
  group: DefaultCompetitorGroup;
  division: Division;
  heat?: HeatData;
  isLiveHeat: boolean;
};

function asDefaultGroup(value?: string | null): DefaultCompetitorGroup | null {
  if (!value) return null;

  if ((DEFAULT_COMPETITOR_GROUPS as readonly string[]).includes(value)) {
    return value as DefaultCompetitorGroup;
  }

  const mapped = (Object.entries(DefaultCompetitorGroupMap) as Array<[DefaultCompetitorGroup, string]>)
    .find(([, label]) => label === value)?.[0];
  return mapped ?? null;
}

function heatDivisions(heat: HeatData, fallbackDivisions: Division[]) {
  if (!heat.divisionsEnabled) return [...DIVISION_OPTIONS];
  const divisions = Array.isArray(heat.divisions) && heat.divisions.length > 0
    ? heat.divisions
    : fallbackDivisions;
  return DIVISION_OPTIONS.filter(division => divisions.includes(division));
}

export function isHeatLive(heat?: HeatData) {
  if (!heat?.startTime || !heat.duration) return false;
  const start = new Date(heat.startTime).getTime();
  const end = start + heat.duration * 60_000;
  const now = Date.now();
  return now >= start && now <= end;
}

export function buildLeaderboardSections(competition: CompetitionEntity): LeaderboardSection[] {
  const fallbackGroups = getSummaryDefaultGroups(competition);
  const fallbackDivisions = getSummaryDivisions(competition);
  const seen = new Set<GroupDivisionKey>();
  const sections: LeaderboardSection[] = [];

  const sortedHeats = [...(competition.heats ?? [])].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  sortedHeats.forEach(heat => {
    const groups = (heat.groups ?? [])
      .map(group => asDefaultGroup(group?.name))
      .filter((group): group is DefaultCompetitorGroup => !!group);

    groups.forEach(group => {
      heatDivisions(heat, fallbackDivisions).forEach(division => {
        const key = `${group}-${division}` as GroupDivisionKey;
        if (seen.has(key)) return;
        seen.add(key);
        sections.push({
          key,
          group,
          division,
          heat,
          isLiveHeat: isHeatLive(heat),
        });
      });
    });
  });

  fallbackGroups.forEach(group => {
    fallbackDivisions.forEach(division => {
      const key = `${group}-${division}` as GroupDivisionKey;
      if (seen.has(key)) return;
      seen.add(key);
      sections.push({
        key,
        group,
        division,
        isLiveHeat: false,
      });
    });
  });

  return sections;
}

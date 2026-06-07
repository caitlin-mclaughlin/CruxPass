import type { Ref } from "react";
import { DefaultCompetitorGroupMap, DivisionEnumMap } from "@/constants/enum";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { RankedSubmissionDto } from "@/models/dtos";
import { formatHeatTimeRange } from "@/utils/datetime";
import { LeaderboardSection } from "@/utils/leaderboardSections";
import { StatusBadge } from "./ui/StatusBadge";

type ScoresBySection = Partial<Record<string, RankedSubmissionDto[]>>;

type LeaderboardSectionsProps = {
  sections: LeaderboardSection[];
  scores: ScoresBySection;
  highlightClimberIds?: number[];
  liveSectionRef?: Ref<HTMLDivElement>;
  live?: boolean;
};

function groupSections(sections: LeaderboardSection[]) {
  return sections.reduce((groups, section) => {
    const existing = groups.get(section.group) ?? [];
    existing.push(section);
    groups.set(section.group, existing);
    return groups;
  }, new Map<LeaderboardSection["group"], LeaderboardSection[]>());
}

function SectionGroups({
  sections,
  scores,
  highlightClimberIds = [],
  live = false,
}: Omit<LeaderboardSectionsProps, "liveSectionRef">) {
  const grouped = groupSections(sections);

  return (
    <div className="space-y-7">
      {[...grouped.entries()].map(([group, groupSections]) => (
        <section key={group} className="space-y-3">
          <h2 className="border-b border-green/20 pb-1 text-2xl font-bold">
            {DefaultCompetitorGroupMap[group]}
          </h2>

          <div className="space-y-4">
            {groupSections.map(section => (
              <div key={section.key} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold">
                    {DivisionEnumMap[section.division]}
                  </h3>
                  {section.heat && (
                    <div className="text-sm text-muted">
                      {section.heat.heatName || "Heat"} • {formatHeatTimeRange(section.heat.startTime, section.heat.duration)}
                    </div>
                  )}
                </div>

                <LeaderboardTable
                  submissions={scores[section.key]}
                  group={section.group}
                  division={section.division}
                  highlightClimberIds={highlightClimberIds}
                  live={live}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function LeaderboardSections({
  sections,
  scores,
  highlightClimberIds = [],
  liveSectionRef,
}: LeaderboardSectionsProps) {
  const liveSections = sections.filter(section => section.isLiveHeat);
  const otherSections = sections.filter(section => !section.isLiveHeat);

  if (sections.length === 0) {
    return (
      <div className="rounded-md border border-green/20 bg-shadow px-3 py-2 shadow-lg text-muted">
        Leaderboard divisions will appear once groups and heats are configured.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {liveSections.length > 0 && (
        <section
          ref={liveSectionRef}
          className="scroll-mt-4 rounded-md border-2 border-highlight bg-shadow p-3 shadow-lg"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-highlight">Live Heat</h2>
            <StatusBadge compStatus={"Active Now"} className="bg-accent text-sm"/>
          </div>

          <SectionGroups
            sections={liveSections}
            scores={scores}
            highlightClimberIds={highlightClimberIds}
            live={true}
          />
        </section>
      )}

      {otherSections.length > 0 && (
        <SectionGroups
          sections={otherSections}
          scores={scores}
          highlightClimberIds={highlightClimberIds}
          live={false}
        />
      )}
    </div>
  );
}

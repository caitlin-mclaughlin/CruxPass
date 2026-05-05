import { AgeRule, CompetitionDraftState, GroupRef } from "@/models/domain";
import { useMemo } from "react";
import { Updater } from "use-immer";

export function useCompetitorGroups(
  draft: CompetitionDraftState,
  selectableGroups: {
    ref: GroupRef;
    label: string;
    ageRule: AgeRule | undefined;
  }[],
  setDraft: Updater<CompetitionDraftState>,
  groupRefKey: (g: GroupRef) => string
) {

  const groupsUsedInHeats = useMemo(
    () =>
      new Set(
        draft.heats.flatMap(h =>
          h.groups.map(g => groupRefKey(g))
        )
      ),
    [draft.heats]
  );

  const unusedSelectedGroups = useMemo(
    () =>
      draft.selectedGroups.filter(
        ref => !groupsUsedInHeats.has(groupRefKey(ref))
      ),
    [draft.selectedGroups, groupsUsedInHeats]
  );

  const unusedSelectedGroupLabels = useMemo(() => {
    const unusedKeys = new Set(unusedSelectedGroups.map(groupRefKey));

    return selectableGroups
      .filter(g => unusedKeys.has(groupRefKey(g.ref)))
      .map(g => g.label);
  }, [unusedSelectedGroups, selectableGroups, groupRefKey]);

  const isGroupUsed = (ref: GroupRef) =>
    groupsUsedInHeats.has(groupRefKey(ref));

  function removeCustomGroupFromDraft(clientId: string) {
    const isTarget = (g: GroupRef) =>
      g.type === 'CUSTOM' && g.clientId === clientId;

    setDraft(draft => {
      draft.selectedGroups = draft.selectedGroups.filter(g => !isTarget(g));

      draft.heats.forEach(h => {
        h.groups = h.groups.filter(g => !isTarget(g));
      });
    });
  }

  function toggleGroup(ref: GroupRef) {
    setDraft(draft => {
      const index = draft.selectedGroups.findIndex(
        g => groupRefKey(g) === groupRefKey(ref)
      )

      if (index >= 0) {
        draft.selectedGroups.splice(index, 1)
      } else {
        draft.selectedGroups.push(ref)
      }
    });
  }

  return {
    groupsUsedInHeats,
    unusedSelectedGroups,
    unusedSelectedGroupLabels,

    isGroupUsed,
    toggleGroup,
    removeCustomGroupFromDraft,
  };
}

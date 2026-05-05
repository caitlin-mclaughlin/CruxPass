import { DEFAULT_COMPETITOR_GROUPS, DefaultGroupMeta } from "@/constants/enum";
import { AgeRule, CompetitionDraftState, CompetitorGroupData, GroupMutationsData, GroupRef } from "@/models/domain";
import { useMemo } from "react";

export function useSelectableGroups(
  persistentGroups: CompetitorGroupData[],
  groupMutations: GroupMutationsData
) {

  const selectableGroups: 
    {
      ref: GroupRef,
      label: string,
      ageRule: AgeRule | undefined
    } [] = useMemo(() => {

    const deletedClientIds = new Set(groupMutations.deleted);
    const updatedMap = new Map(
      groupMutations.updated.map(g => [g.clientId, g])
    );

    const baseCustomGroups = persistentGroups
      .filter(g => !deletedClientIds.has(g.clientId))
      .map(g => {
        const group = updatedMap.get(g.clientId) ?? g;

        return {
          ref: {
            type: 'CUSTOM',
            clientId: group.clientId,
          } as GroupRef,
          label: group.name,
          ageRule: group.ageRule,
        };
      });

    const createdCustomGroups = groupMutations.created
      .filter(g => !deletedClientIds.has(g.clientId))
      .map(g => ({
        ref: {
          type: 'CUSTOM',
          clientId: g.clientId,
        } as GroupRef,
        label: g.name,
        ageRule: g.ageRule,
      }));

    return [
      ...DEFAULT_COMPETITOR_GROUPS.map(key => ({
        ref: { type: 'DEFAULT', key } as GroupRef,
        label: DefaultGroupMeta[key].label,
        ageRule: DefaultGroupMeta[key].ageRule,
      })),

      ...baseCustomGroups,
      ...createdCustomGroups,
    ];

  }, [persistentGroups, groupMutations]);

  function groupRefEquals(a: GroupRef, b: GroupRef): boolean {
    if (a.type !== b.type) return false;

    if (a.type === 'DEFAULT') {
      return a.key === (b as any).key;
    }

    return a.clientId === (b as any).clientId;
  }

  function groupRefKey(ref: GroupRef): string {
    return ref.type === 'DEFAULT'
        ? `DEFAULT:${ref.key}`
        : `CUSTOM:${ref.clientId}`;
  }

  function buildSelectedSet(selectedGroups: GroupRef[]) {
    return new Set(selectedGroups.map(groupRefKey));
  }

  return {
    selectableGroups,
    groupRefEquals,
    groupRefKey,
    buildSelectedSet,
  }
}
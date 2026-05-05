import { ActionOptions } from "@/constants/enum";
import { groupMutationsReducer } from "@/models/compHelpers";
import { CompetitorGroupData, GroupMutationsData, GymData } from "@/models/domain";
import { CompetitorGroupDto, CreateCompetitorGroupDto, GroupMutationsDto } from "@/models/dtos";
import { useEffect, useMemo, useReducer } from "react";

export function createEmptyGroupMutations(): GroupMutationsData {
  return {
    created: [],
    updated: [],
    deleted: [],
  };
}

export function parseDbKey(key: string): number {
  if (!key.startsWith('db-')) {
    throw new Error(`Invalid db key: ${key}`);
  }
  return Number(key.slice(3));
}

export function useGroupMutations(
  gym: GymData,
  isEdit: boolean,
  compId?: string,
) {

  /** LOCAL STORAGE **/
  function groupMutationsKey(gymId: number, compId?: number) {
    return isEdit
      ? `cruxpass:competition:draft:${gymId}:${compId}:groups`
      : `cruxpass:competition:draft:${gymId}:new:groups`;
  }

  function deleteMutationsStorageKey() {
    if (isEdit) localStorage.removeItem(groupMutationsKey(gym.id, Number(compId)));
    else localStorage.removeItem(groupMutationsKey(gym.id));
  }

  const groupKey = useMemo(() => {
    if (isEdit && compId) {
      return groupMutationsKey(gym.id, Number(compId));
    }
    return groupMutationsKey(gym.id);
  }, [gym.id, isEdit, compId]);


  function loadInitialMutations(): GroupMutationsData {
    const saved = localStorage.getItem(groupKey);
    if (!saved) return createEmptyGroupMutations();

    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem(groupKey);
      return createEmptyGroupMutations();
    }
  }

  const [groupMutations, dispatch] = useReducer((state, action) => 
    groupMutationsReducer(state, action),
    undefined,
    loadInitialMutations
  );
  
  /** FUNCTIONS **/
  function createGroup(group: CompetitorGroupData) {
    dispatch({ type: ActionOptions.CREATE, group });
  }

  function updateGroup(group: CompetitorGroupData) {
    dispatch({ type: ActionOptions.UPDATE, group });
  }

  function deleteGroup(group: CompetitorGroupData) {
    dispatch({ type: ActionOptions.DELETE, group });
  }

  function buildMutationsPayload(): GroupMutationsDto {
    const created: CreateCompetitorGroupDto[] = groupMutations.created.map((g) => {
      return {
        ownerId: g.ownerId,
        clientId: g.clientId,
        name: g.name,
        constrained: g.constrained,
        ageRule: g.constrained ? g.ageRule : undefined
      } as CreateCompetitorGroupDto
    });
    const updated: CompetitorGroupDto[] = groupMutations.updated.map((g) => {
      return {
        id: g.id,
        ownerId: g.ownerId,
        name: g.name,
        constrained: g.constrained,
        ageRule: g.constrained ? g.ageRule : undefined
      } as CompetitorGroupDto
    });
    const deleted: number[] = groupMutations.deleted.map((g) => parseDbKey(g));

    return {
      created,
      updated,
      deleted
    };
  }

  useEffect(() => {
    localStorage.setItem(groupKey, JSON.stringify(groupMutations));
  }, [groupMutations, groupKey]);

  return {
    groupMutations,

    deleteMutationsStorageKey,
    createGroup,
    updateGroup,
    deleteGroup,
    buildMutationsPayload
  }
}
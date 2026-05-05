import { ActionOptions, DefaultGroupMeta, labelToDefaultKey } from "@/constants/enum";
import { AgeRule, CompetitionDraftState, CompetitionEntity, CompetitorGroupData, GroupMutationAction, GroupMutationsData, GroupRef, HeatDraft } from "./domain";
import { addMinutes, ensureDate, formatForApi, normalizeBackendDateOrDateTime } from "@/utils/datetime";
import { CreateCompetitionDto, CreatedGroupResult, GroupRefDto, ResolvedCompetitorGroup, UpdateCompetitionDto } from "./dtos";
import { differenceInMinutes } from "date-fns";
import { createEmptyGroupMutations, parseDbKey } from "@/hooks/useGroupMutations";

export const AGE_TYPE_OPTIONS = [
  { value: 'AGE', label: 'Age' },
  { value: 'BIRTHYEAR', label: 'Birth Year' },
];

export function ParseAgeRule(rule: AgeRule): string {
  var ret: string;
  if (rule.min && rule.max) {
    if (rule.min === rule.max) ret = String(rule.min);
    else ret = String(rule.min + "-" + rule.max);
  } else {
    if (rule.min) ret = String("≥" + rule.min);
    else ret = String("≤" + rule.max);
  }
  return ret;
}

export function getAnchorStart(heats: HeatDraft[]): Date | null {
  const starts = heats
    .map(h => ensureDate(h.startTime))
    .filter((d): d is Date => !!d);

  if (starts.length === 0) return null;

  return new Date(Math.min(...starts.map(d => d.getTime())));
}


export function deriveBuffers(heats: HeatDraft[]): number[] {
  const buffers: number[] = [];

  for (let i = 1; i < heats.length; i++) {
    const prev = heats[i - 1];
    const curr = heats[i];

    if (
      !prev.startTime ||
      !prev.duration ||
      !curr.startTime
    ) {
      buffers.push(0);
      continue;
    }

    const prevDate = ensureDate(prev.startTime);
    const currDate = ensureDate(curr.startTime);
    if (!prevDate || !currDate) {
      buffers.push(0);
      continue;
    };
    const prevEnd = addMinutes(prevDate, Number(prev.duration));
    buffers.push(differenceInMinutes(currDate, prevEnd));
  }

  return buffers;
}

export function reflowHeatStartTimes(
  reordered: HeatDraft[],
  buffers: number[],
  anchor: Date | null
): HeatDraft[] {
  if (!anchor || reordered.length === 0) return reordered;

  const next = reordered.map(h => ({ ...h }));

  next[0].startTime = anchor;

  for (let i = 1; i < next.length; i++) {
    const prev = next[i - 1];

    if (!prev.startTime || !prev.duration) {
      next[i].startTime = null;
      continue;
    }

    const prevDate = ensureDate(prev.startTime);
    if (!prevDate) break;
    const prevEnd = addMinutes(prevDate, Number(prev.duration));
    const buffer = buffers[i - 1] ?? 0;

    next[i].startTime = addMinutes(prevEnd, buffer);
  }

  return next;
}

export function resolveGroupMeta(
  ref: GroupRef,
  customGroups: CompetitorGroupData[]
): string {
  if (ref.type === 'DEFAULT') return DefaultGroupMeta[ref.key].label;
  return customGroups.find(g => g.clientId === ref.clientId)?.name ?? '';
}

export function getMutatableGroupFromRef(
  ref: GroupRef,
  customGroups: CompetitorGroupData[],
  groupMutations: GroupMutationsData
): CompetitorGroupData | undefined {
  if (ref.type === 'DEFAULT') return undefined;
  let group = customGroups.find(g => g.clientId === ref.clientId);
  if (!group) group = groupMutations.created.find(g => g.clientId === ref.clientId);
  if (!group) group = groupMutations.updated.find(g => g.clientId === ref.clientId);
  return group ?? undefined;
}

export function resolvedToGroupRef(g: ResolvedCompetitorGroup): GroupRef {
  return g.id
    ? { type: 'CUSTOM', clientId: `db-${g.id}` }
    : { type: 'DEFAULT', key: labelToDefaultKey(g.name) }
}

export function groupRefToDto(g: GroupRef): GroupRefDto {
  if (g.type === 'DEFAULT') return g
  return {
    type: g.type,
    id: parseDbKey(g.clientId)
  }
}

/** REDUCER AND HELPERS **/
function upsertByClientId<T extends { clientId: string }>(
  list: T[],
  item: T
): T[] {
  const idx = list.findIndex(g => g.clientId === item.clientId);
  if (idx === -1) return [...list, item];

  const next = [...list];
  next[idx] = item;
  return next;
}

function removeByClientId<T extends { clientId: string }>(
  list: T[],
  clientId: string
): T[] {
  return list.filter(g => g.clientId !== clientId);
}

export function groupMutationsReducer(
  state: GroupMutationsData,
  action: GroupMutationAction
): GroupMutationsData {

  switch (action.type) {

    // -------------------------
    // CREATE
    // -------------------------
    case ActionOptions.CREATE: {
      const g = action.group;
      if (!g) return state;

      return {
        ...state,
        created: upsertByClientId(state.created, g),
        // ensure not in other buckets
        updated: removeByClientId(state.updated, g.clientId),
        deleted: state.deleted.filter(id => id !== g.clientId),
      };
    }

    // -------------------------
    // UPDATE
    // -------------------------
    case ActionOptions.UPDATE: {
      const g = action.group;
      if (!g) return state;

      // if it was newly created → still just created
      if (state.created.some(x => x.clientId === g.clientId)) {
        return {
          ...state,
          created: upsertByClientId(state.created, g),
        };
      }

      // otherwise → updated bucket
      return {
        ...state,
        updated: upsertByClientId(state.updated, g),
        deleted: state.deleted.filter(id => id !== g.clientId),
      };
    }

    // -------------------------
    // DELETE
    // -------------------------
    case ActionOptions.DELETE: {
      const g = action.group;
      if (!g) return state;

      // if created locally → erase completely
      if (state.created.some(x => x.clientId === g.clientId)) {
        return {
          ...state,
          created: removeByClientId(state.created, g.clientId),
          updated: removeByClientId(state.updated, g.clientId),
        };
      }

      // existing backend group → mark deleted
      return {
        ...state,
        created: removeByClientId(state.created, g.clientId),
        updated: removeByClientId(state.updated, g.clientId),
        deleted: state.deleted.includes(g.clientId)
          ? state.deleted
          : [...state.deleted, g.clientId],
      };
    }

    default:
      return state;
  }
}
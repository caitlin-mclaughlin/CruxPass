import { useImmer } from "use-immer";
import { CompetitionFormat } from "@/constants/enum";
import { groupRefToDto, resolvedToGroupRef } from "@/models/compHelpers";
import { CompetitionDraftState, CompetitionEntity, GroupRef, GymData, HeatDraft } from "@/models/domain";
import { CreateCompetitionDto, CreatedGroupResult, UpdateCompetitionDto } from "@/models/dtos";
import { ensureDate, formatForApi, normalizeBackendDateOrDateTime } from "@/utils/datetime";
import { useEffect, useMemo, useRef, useState } from "react";

export function useCompetitionDraft(
  gym: GymData,
  isEdit: boolean,
  compId?: string,
  loadedDraft?: CompetitionDraftState
) {

  function competitionDraftKey(gymId: number, compId?: number) {
    return compId
      ? `cruxpass:competition:draft:${gymId}:${compId}`
      : `cruxpass:competition:draft:${gymId}:new`;
  }  

  // Determine storage key for localStorage
  const storageKey = useMemo(() => {
    if (isEdit && compId) {
      return competitionDraftKey(gym.id, Number(compId));
    }
    return competitionDraftKey(gym.id);
  }, [gym.id, isEdit, compId]);

  // Create a fresh empty draft (for new competitions)
  function createEmptyDraft(): CompetitionDraftState {
    return {
      name: "",
      startDate: null,
      deadline: null,
      types: [],
      compFormat: '' as CompetitionFormat,
      pricingType: 'FLAT',
      flatFee: 0,
      feeCurrency: 'USD',
      pricingRules: [],
      selectedGroups: [],
      heats: [
        {
          clientId: crypto.randomUUID(),
          startTime: null,
          capacity: '',
          duration: '',
          groups: [],
          divisions: [],
          divisionsEnabled: true,
        },
      ],
      hostGymName: gym.name,
      location: gym.address,
    };
  }

  // Phase flags
  const hasRestoredFromStorageRef = useRef(false);
  const hasHydratedFromBackendRef = useRef(false);

  // Initial state (sync once)
  const [draft, setDraft] = useImmer<CompetitionDraftState>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        localStorage.removeItem(storageKey);
      }
    }

    return loadedDraft ?? createEmptyDraft();
  });

  function hydrateCompetitionDraft(raw: CompetitionDraftState): CompetitionDraftState {
    return {
      ...raw,

      pricingRules: (raw.pricingRules ?? []).map(rule => {
        const legacyRule = rule as typeof rule & { group?: GroupRef };
        return {
          ...rule,
          groups: rule.groups ?? (legacyRule.group ? [legacyRule.group] : []),
        };
      }),

      // hydrate heats
      heats: (raw.heats ?? []).map((h: HeatDraft) => ({
        ...h,
        startTime: ensureDate(h.startTime),
      })),

      // if you have other Date fields, hydrate them too:
      startDate: ensureDate(raw.startDate),
      deadline: ensureDate(raw.deadline)
    };
  }

  // Phase 1: restore from local storage (once)
  useEffect(() => {
    if (hasRestoredFromStorageRef.current) return;

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hydrated = hydrateCompetitionDraft(parsed);
        setDraft(hydrated);
      } catch (err) {
        console.error("Failed to hydrate draft", err);
        localStorage.removeItem(storageKey);
      }
    } 

    hasRestoredFromStorageRef.current = true;
  }, [storageKey]);

  // Phase 2: hydrate from backend (once)
  useEffect(() => {
    if (!loadedDraft) return;
    if (hasHydratedFromBackendRef.current) return;

    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      // Only hydrate if no local edits exist
      setDraft(loadedDraft);
    }

    hasHydratedFromBackendRef.current = true;
  }, [loadedDraft, storageKey]);

  // Phase 3: persist changes to localStorage (every time)
  useEffect(() => {
    if (!draft) return;
    if (isEdit && !hasHydratedFromBackendRef.current) return;
    localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [draft, storageKey]);  

  /** MAPPERS **/
  function mapCompetitionToDraft(
    comp: CompetitionEntity
  ): CompetitionDraftState {
    return {
      id: comp.id,
      name: comp.name,
      startDate: normalizeBackendDateOrDateTime(comp.startDate),
      deadline: normalizeBackendDateOrDateTime(comp.deadline),
      types: comp.types,
      compFormat: comp.compFormat,
      pricingType: comp.pricingType ?? 'FLAT',
      flatFee: comp.flatFee ?? 0,
      feeCurrency: comp.feeCurrency ?? 'USD',
      pricingRules: (comp.pricingRules ?? []).map(r => {
        const legacyRule = r as typeof r & { group?: typeof r.groups[number] };
        const groups = r.groups ?? (legacyRule.group ? [legacyRule.group] : []);

        return {
          id: r.id,
          clientId: crypto.randomUUID(),
          ruleType: r.ruleType,
          groups: groups.map(g => resolvedToGroupRef(g)),
          minAge: r.minAge,
          maxAge: r.maxAge,
          amount: r.amount,
          priority: r.priority,
        };
      }),
      selectedGroups: comp.selectedGroups.map(g => resolvedToGroupRef(g)),
      heats: comp.heats.map(h => ({
        id: h.id,
        clientId: crypto.randomUUID(),
        heatName: h.heatName,
        startTime: normalizeBackendDateOrDateTime(h.startTime),
        capacity: h.capacity,
        duration: h.duration,
        groups: h.groups.map(g => resolvedToGroupRef(g)),
        divisions: h.divisionsEnabled ? h.divisions : [],
        divisionsEnabled: h.divisionsEnabled,
      })),
      hostGymName: comp.hostGymName,
      location: comp.location,
    };
  }
  
  function mapDraftToCompetitionUpsertDto(
    draft: CompetitionDraftState,
    gymId: number
  ): CreateCompetitionDto {
  
    return {
      gymId,
      name: draft.name.trim(),
      startDate: formatForApi(draft.startDate!),     // safe after validation
      deadline: formatForApi(draft.deadline!),
      types: draft.types,
      compFormat: draft.compFormat,
      pricingType: draft.pricingType,
      flatFee: draft.pricingType === 'FLAT' ? Number(draft.flatFee || 0) : undefined,
      feeCurrency: (draft.feeCurrency || 'USD').trim().toUpperCase(),
      pricingRules: draft.pricingType === 'FLAT'
        ? []
        : draft.pricingRules.map(r => ({
            id: r.id,
            ruleType: r.ruleType,
            groups: r.groups.map(g => groupRefToDto(g)),
            minAge: r.minAge,
            maxAge: r.maxAge,
            amount: Number(r.amount),
            priority: Number(r.priority || 100),
          })),
      selectedGroups: draft.selectedGroups.map(g => groupRefToDto(g)),
      hostGymName: draft.hostGymName,
      location: draft.location,
      heats: draft.heats.map(h => ({
        id: h.id, // may be undefined
        heatName: h.heatName?.trim() || undefined,
        startTime: formatForApi(h.startTime!), // or already formatted
        capacity: Number(h.capacity),
        duration: Number(h.duration),
        groups: h.groups.map(g => groupRefToDto(g)),
        divisions: h.divisionsEnabled ? h.divisions : [],
        divisionsEnabled: h.divisionsEnabled,
      })),
    };
  }
  
  function mapDraftToCompetitionDto(
    draft: CompetitionDraftState,
    gymId: number
  ): UpdateCompetitionDto {
  
    if (!draft.id) throw new Error("Draft missing id");
  
    return {
      id: draft.id,
      ...mapDraftToCompetitionUpsertDto(draft, gymId),
    };
  }

  function reconcileGroupIdsSync(
    draft: CompetitionDraftState,
    createdResults: CreatedGroupResult[]
  ): CompetitionDraftState {
    const idMap = new Map(
      createdResults.map(r => [r.clientId, `db-${r.dbId}`])
    );

    const mapRef = (ref: GroupRef): GroupRef => {
      if (ref.type !== 'CUSTOM') return ref;

      const newId = idMap.get(ref.clientId);
      if (!newId) return ref;

      return { ...ref, clientId: newId };
    };

    return {
      ...draft,
      selectedGroups: draft.selectedGroups.map(mapRef),
      pricingRules: draft.pricingRules.map(r => ({
        ...r,
        groups: r.groups.map(mapRef),
      })),
      heats: draft.heats.map(h => ({
        ...h,
        groups: h.groups.map(mapRef),
      })),
    };
  }

  return { 
    draft, setDraft,
    competitionDraftKey,
    
    reconcileGroupIdsSync,
    mapCompetitionToDraft,
    mapDraftToCompetitionDto,
    mapDraftToCompetitionUpsertDto,
   };
}

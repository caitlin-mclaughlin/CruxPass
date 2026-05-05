import { deriveBuffers, getAnchorStart, reflowHeatStartTimes } from "@/models/compHelpers";
import { CompetitionDraftState, GroupRef } from "@/models/domain";
import { moveItem } from "@/utils/formatters";
import { useState, useEffect } from "react";
import { Updater } from "use-immer";

export function useCompetitionHeats(
  draft: CompetitionDraftState,
  selectedSet: Set<string>,
  setDraft: Updater<CompetitionDraftState>,
  groupRefKey: (ref: GroupRef) => string
) {

  function findHeatOrThrow(
    draft: CompetitionDraftState,
    clientId: string
  ): CompetitionDraftState['heats'][number] {
    const heat = draft.heats.find(h => h.clientId === clientId);

    if (!heat) {
      throw new Error(`Heat not found: ${clientId}`);
    }

    return heat;
  }
  
  const [buffer, setBuffer] = useState<number | ''>(15);

  const createEmptyHeatDraft = () => {
    setDraft(draft => {
      draft.heats.push({
        clientId: crypto.randomUUID(),
        startTime: null,
        capacity: '',
        duration: '',
        groups: [],
        divisions: [],
        divisionsEnabled: true,
      });
    });
  };

  const updateHeat = (
    clientId: string,
    patch: Partial<CompetitionDraftState['heats'][number]>
  ) => {
    setDraft(draft => {
      const heat = findHeatOrThrow(draft, clientId);

      Object.assign(heat, patch);
    });
  };

  const moveHeat = (
    clientId: string,
    direction: 'up' | 'down'
  ) => {
    setDraft(draft => {
      const index = draft.heats.findIndex(h => h.clientId === clientId);
      if (index === -1) return;

      const target = direction === 'up' ? index - 1 : index + 1;

      if (target < 0 || target >= draft.heats.length) {
        return;
      }

      const buffers = deriveBuffers(draft.heats);
      const anchor = getAnchorStart(draft.heats);

      const reordered = moveItem(draft.heats, index, target);
      const reflowed = reflowHeatStartTimes(reordered, buffers, anchor);

      draft.heats = reflowed;
    });
  };

  const removeHeat = (clientId: string) => {
    setDraft(draft => {
      draft.heats = draft.heats.filter(h => h.clientId !== clientId);
    });
  };

  // enforce invariant: heat.groups ⊆ selectedGroups
  useEffect(() => {
    setDraft(draft => {
      draft.heats.forEach(h => {
        h.groups = h.groups.filter(g =>
          selectedSet.has(groupRefKey(g))
        );
      });
    });
  }, [draft.selectedGroups]);

  return {
    buffer,
    setBuffer,
    createEmptyHeatDraft,
    updateHeat,
    moveHeat,
    removeHeat
  };
}

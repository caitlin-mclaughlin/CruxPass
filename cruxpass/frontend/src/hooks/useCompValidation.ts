import { CompetitionDraftState, GroupRef } from "@/models/domain";

export function useCompetitionValidation(
    draft: CompetitionDraftState,
    unusedSelectedGroups: GroupRef[]
) {

  const basicInfoInvalid =
    !draft.name.trim() ||
    !draft.startDate ||
    !draft.deadline ||
    draft.types.length === 0 ||
    !draft.compFormat;

  const noGroupsSelected = draft.selectedGroups.length === 0

  const selectedGroupUnused = unusedSelectedGroups.length !== 0

  const pricingInvalid = (() => {
    if (!draft.pricingType ) return true;
    if (!draft.feeCurrency?.trim() || draft.feeCurrency === '') return true;

    if (draft.pricingType === 'FLAT') {
      return draft.flatFee === '' || Number(draft.flatFee) < 0;
    }

    if (!draft.pricingRules?.length) return true;

    return draft.pricingRules.some(rule => {
      if (rule.amount === '' || Number(rule.amount) < 0) return true;
      if (rule.priority === '' || Number(rule.priority) < 0) return true;

      if (draft.pricingType === 'BY_GROUP') {
        return rule.ruleType !== 'GROUP' || rule.groups.length === 0;
      }

      if (draft.pricingType === 'BY_AGE') {
        if (rule.ruleType !== 'AGE') return true;
        if (rule.minAge == null && rule.maxAge == null) return true;
        if (rule.minAge != null && rule.maxAge != null && rule.minAge > rule.maxAge) return true;
      }
      return false;
    });
  })();

  const invalidHeats = draft.heats.some(heat =>
    !heat.startTime ||
    heat.capacity === '' ||
    heat.duration === '' ||
    heat.groups.length === 0 ||
    (heat.divisionsEnabled && heat.divisions.length === 0)
  )

  const formInvalid = basicInfoInvalid || noGroupsSelected || selectedGroupUnused || pricingInvalid || invalidHeats

  return {
    basicInfoInvalid,
    noGroupsSelected,
    selectedGroupUnused,
    pricingInvalid,
    invalidHeats,
    formInvalid
  }

}

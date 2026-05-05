import { CompetitionDraftState, PricingRuleDraft } from "@/models/domain";
import { Updater } from "use-immer";

export function usePricingRules(
  rules: PricingRuleDraft[],
  setDraft: Updater<CompetitionDraftState>
) {
  function createPricingRule(ruleType: 'AGE' | 'GROUP'): PricingRuleDraft {
    const numRules = rules.length;
    return {
      clientId: crypto.randomUUID(),
      ruleType,
      groups: [],
      minAge: undefined,
      maxAge: undefined,
      amount: '',
      priority: numRules === 0 ? 1 : Number(rules[numRules-1].priority) + 1,
    };
  }

  function updatePricingRule(
    clientId: string,
    patch: Partial<PricingRuleDraft>
  ) {
    setDraft(draft => {
      const rule = draft.pricingRules.find(r => r.clientId === clientId);
      if (!rule) return;

      Object.assign(rule, patch);
    });
  }

  function removePricingRule(clientId: string) {
    setDraft(draft => {
      draft.pricingRules = draft.pricingRules.filter(
        rule => rule.clientId !== clientId
      );
    });
  }

  return {
    createPricingRule,
    updatePricingRule,
    removePricingRule,
  };
}

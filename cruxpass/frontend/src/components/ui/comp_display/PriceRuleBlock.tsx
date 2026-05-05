import { AgeRule, CompetitionDraftState, GroupRef, PricingRuleDraft } from "@/models/domain";
import { Input } from "../Input";
import { Button } from "../Button";
import { Plus } from "lucide-react";
import { Updater } from "use-immer";
import { Checkbox } from "../Checkbox";

interface Props {
  selectedGroupOptions: {
    ref: GroupRef;
    label: string;
    ageRule: AgeRule | undefined;
  }[];
  draft: CompetitionDraftState;
  showErrors: boolean;
  invalidField: string;
  setDraft: Updater<CompetitionDraftState>;
  groupRefKey: (g: GroupRef) => string;
  createPricingRule: (ruleType: "AGE" | "GROUP") => PricingRuleDraft;
  updatePricingRule: (clientId: string, patch: Partial<PricingRuleDraft>) => void;
  removePricingRule: (clientId: string) => void;
}

export function PriceRuleBlock({
  selectedGroupOptions,
  draft,
  showErrors,
  invalidField,
  setDraft,
  groupRefKey,
  createPricingRule,
  updatePricingRule,
  removePricingRule
}: Props) {

  const groupLabelByKey = new Map(
    selectedGroupOptions.map(g => [groupRefKey(g.ref), g.label])
  );

  return (
    <div className="mt-5">
      <h3 className="text-lg font-semibold">Pricing Rules</h3>
      <p className="text-muted mb-2">
        Configure registration fees by {draft.pricingType === 'BY_AGE' ? 'age range' : 'competitor group'}.
      </p>

      <div className="space-y-4">
        {draft.pricingRules.map((rule, idx) => (
          <div key={rule.clientId} className="rounded-md shadow-md border bg-shadow px-3 py-2 space-y-2">
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              <div className="flex-1">
                <label className="font-semibold">Rule Name (Optional)</label>
                <Input
                  placeholder={`Rule ${idx + 1}`}
                  className="bg-background"
                  value={rule.name}
                  onChange={e => updatePricingRule(rule.clientId, { name: e.target.value })}
                />
              </div>
              <div className="flex justify-end items-center">
                <Button
                  className="bg-accent hover:bg-accentHighlight"
                  onClick={() => removePricingRule(rule.clientId)}
                >
                  Remove Rule
                </Button>
              </div>
            </div>

            {/* PRICE WARNINGS */}
            <div className="text-sm text-accent">
              {showErrors && (
                <>
                  {draft.feeCurrency === '' && (
                    <p>Currency not set.</p>
                  )}

                  {draft.pricingType === 'FLAT' && draft.flatFee === '' && (
                    <p>Price not set.</p>
                  )}
                </>
              )}
            </div>

            {draft.pricingType === 'BY_GROUP' && (
              <div>
                <label className="font-semibold">Competitor Groups</label>
                <div
                  className={`flex flex-wrap gap-x-4 gap-y-2 border bg-background rounded-md px-3 py-1 ${
                    showErrors && rule.groups.length === 0 ? `${invalidField}` : ''}
                  `}
                >
                  {selectedGroupOptions.map(group => {
                    const checked = rule.groups.some(
                      g => groupRefKey(g) === groupRefKey(group.ref)
                    );

                    return (
                      <label key={groupRefKey(group.ref)} className="flex items-center gap-2">
                        <Checkbox
                          className={`bg-shadow ${
                            showErrors && rule.groups.length === 0 ? `${invalidField}` : ''}
                          `}
                          checked={checked}
                          onCheckedChange={() =>
                            updatePricingRule(rule.clientId, {
                              ruleType: 'GROUP',
                              groups: checked
                                ? rule.groups.filter(g => groupRefKey(g) !== groupRefKey(group.ref))
                                : [...rule.groups, group.ref],
                            })
                          }
                        />
                        <span className="relative top-[1px]">{group.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {draft.pricingType === 'BY_AGE' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                <div>
                  <label className="font-semibold">Min Age</label>
                  <Input
                    className={showErrors && !rule.minAge && ! rule.maxAge 
                      ? `bg-background ${invalidField}` 
                      : 'bg-background'}
                    type="number"
                    min={0}
                    value={rule.minAge ?? ''}
                    onChange={e =>
                      updatePricingRule(rule.clientId, {
                        ruleType: 'AGE',
                        minAge: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="font-semibold">Max Age</label>
                  <Input
                    className={showErrors && !rule.minAge && ! rule.maxAge 
                      ? `bg-background ${invalidField}` 
                      : 'bg-background'}
                    type="number"
                    min={0}
                    value={rule.maxAge ?? ''}
                    onChange={e =>
                      updatePricingRule(rule.clientId, {
                        ruleType: 'AGE',
                        maxAge: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
              <div>
                <label className="font-semibold">Fee (Dollars)</label>
                <Input
                  className={showErrors && (!rule.amount || rule.amount === 0)
                    ? `bg-background ${invalidField}` 
                    : 'bg-background'}
                  type="number"
                  placeholder="e.g. 35 or 35.00 for $35.00"
                  min={0}
                  value={rule.amount}
                  onChange={e =>
                    updatePricingRule(rule.clientId, {
                      amount: e.target.value === '' ? '' : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="font-semibold">Priority (1 = Highest priority)</label>
                <Input
                  className={showErrors && (!rule.priority || rule.priority === 0)
                    ? `bg-background ${invalidField}` 
                    : 'bg-background'}
                  type="number"
                  min={0}
                  value={rule.priority}
                  onChange={e =>
                    updatePricingRule(rule.clientId, {
                      priority: e.target.value === '' ? '' : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            {/* PRICE EXPLANATION */}
            <div className="text-sm pt-1">
              {rule.ruleType === 'AGE' && rule.amount ? (
                <>
                  {/* Age constraint based on age */}
                  {rule.minAge && rule.maxAge ? (
                    <>
                      {/* Min and Max are both defined */}
                      {rule.minAge === rule.maxAge ? (
                        <p>{`${rule.minAge} year old climbers will pay $${rule.amount}.`}</p>
                      ) : (
                        <p>{`${rule.minAge}-${rule.maxAge} year old climbers will pay $${rule.amount}.`}</p>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Min or Max is defined */}
                      {rule.minAge ? (
                        <p>{`Climbers ${rule.minAge} years old and up will pay $${rule.amount}.`}</p>
                      ) : (
                        <p>{`Climbers ${rule.maxAge} years old and younger will pay $${rule.amount}.`}</p>
                      )}
                    </>
                  )}
                </>
              ) : rule.ruleType === 'GROUP' && rule.groups.length > 0 && rule.amount && (
                <p>{`Climbers in ${rule.groups
                  .map(g => groupLabelByKey.get(groupRefKey(g)) ?? 'selected group')
                  .join(', ')} will pay $${rule.amount}.`}</p>
              )}
            </div>

            {/* PER RULE WARNINGS */}
            <div className="text-sm text-accent">
              {showErrors && (
                <>
                  {rule.amount === '' && (
                    <p>Price not set.</p>
                  )}

                  {rule.ruleType === 'AGE' && !rule.minAge && !rule.maxAge && (
                    <p>At least one age must be set.</p>
                  )}
                  
                  {rule.ruleType === 'GROUP' && rule.groups.length === 0 && (
                    <p>At least one group must be selected.</p>
                  )}

                  {rule.priority === '' && (
                    <p>Priority not set.</p>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2">
        <Button
          onClick={() =>
            setDraft(draft => {
              draft.pricingRules.push(
                createPricingRule(
                  draft.pricingType === 'BY_AGE' ? 'AGE' : 'GROUP'
                )
              );
            })
          }
        >
          <Plus size={18} />
          <span className="relative top-[1px]">Add Pricing Rule</span>
        </Button>
      </div>
    </div>
  )
}

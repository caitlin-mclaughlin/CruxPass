import { PricingRuleData } from "@/models/domain";
import { StatusBadge } from "../StatusBadge";

export default function PricingRulesDisplay({
  pricingType,
  flatFee,
  feeCurrency = 'USD',
  pricingRules = [],
}: {
  pricingType: 'FLAT' | 'BY_AGE' | 'BY_GROUP';
  flatFee?: number;
  feeCurrency?: string;
  pricingRules?: PricingRuleData[];
}) {

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: feeCurrency,
    maximumFractionDigits: 0,
  });

  function formatAmount(amount?: number) {
    return currencyFormatter.format(amount ?? 0);
  }

  function getAgeLabel(rule: {
    minAge?: number;
    maxAge?: number;
  }) {
    if (rule.minAge != null && rule.maxAge != null) {
      return `${rule.minAge}-${rule.maxAge}`;
    }

    if (rule.minAge != null) {
      return `${rule.minAge}+`;
    }

    if (rule.maxAge != null) {
      return `≤ ${rule.maxAge}`;
    }

    return 'All Ages';
  }

  function getGroupKey(group: {
    type: 'DEFAULT' | 'CUSTOM';
    key?: string;
    clientId?: string;
  }) {
    return group.type === 'DEFAULT'
      ? `DEFAULT:${group.key}`
      : `CUSTOM:${group.clientId}`;
  }

  return (
    <div className="w-full rounded-md border border-green/20 bg-shadow shadow-lg overflow-hidden">

      {/* Header */}
      <div className="border-b border-green/20 px-3 py-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-start">
          <h2 className="text-lg font-semibold text-green">
            Registration Pricing
          </h2>
          <p className="text-sm text-prompt">
            Competition entry fee structure
          </p>
        </div>

        <StatusBadge className="text-sm w-fit" compStatus=
          {pricingType === 'FLAT'
            ? 'Flat Rate'
            : pricingType === 'BY_AGE'
              ? 'Age Based'
              : 'Group Based'}
        />
      </div>

      {/* Flat Pricing */}
      {pricingType === 'FLAT' && (
        <div className="flex flex-col items-center justify-center p-4 gap-1 text-center">
          <div className="text-sm uppercase tracking-[0.2em] text-prompt">
            Registration Fee
          </div>

          <div className="text-3xl sm:text-4xl font-bold text-green tracking-tight">
            {formatAmount(flatFee)}
          </div>

          <div className="text-sm text-prompt">
            One price for all competitors
          </div>
        </div>
      )}

      {/* Rule Pricing */}
      {(pricingType === 'BY_AGE' || pricingType === 'BY_GROUP') && (
        <div className="p-3 sm:p-4">
          <div className="grid gap-3">
            {pricingRules.map((rule, index) => (
              <div
                key={rule.id ?? index}
                className="rounded-xl border border-green/20 bg-background px-4 py-4 shadow-lg transition-all duration-200 hover:border-select/40 hover:shadow-lg"
              >
                <div className="flex flex-col flex-row sm:items-center sm:justify-between gap-4">

                  {/* Left Side */}
                  <div className="flex-1 min-w-0">
                    {rule.name && (
                      <div className="text-base font-semibold text-select mb-2">
                        {rule.name}
                      </div>
                    )}

                    {/* Age Rules */}
                    {pricingType === 'BY_AGE' && (
                      <>
                        <div className="text-xs uppercase tracking-[0.16em] text-prompt mb-1">
                          Age Range
                        </div>

                        <div className="text-lg font-semibold text-green">
                          {getAgeLabel(rule)}
                        </div>
                      </>
                    )}

                    {/* Group Rules */}
                    {pricingType === 'BY_GROUP' && (
                      <>
                        <div className="text-xs uppercase tracking-[0.16em] text-prompt text-left mb-1">
                          Competitor Groups
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {(rule.groups ?? []).map((group, groupIndex) => {
                            const key = group.id != null
                              ? `group-${group.id}`
                              : `group-${group.name ?? 'default'}-${groupIndex}`;

                            return (
                              <div
                                key={key}
                                className="rounded-full border border-green/20 bg-shadow px-3 py-1 text-sm font-medium text-green"
                              >
                                {group.name}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Price */}
                  <div className="sm:text-right shrink-0">
                    <div className="text-xs uppercase tracking-[0.16em] text-prompt text-right mb-1">
                      Price
                    </div>

                    <div className="text-2xl font-bold text-green tracking-tight">
                      {formatAmount(rule.amount)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

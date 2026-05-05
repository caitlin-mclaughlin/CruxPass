package com.cruxpass.dtos.responses;

import com.cruxpass.dtos.ResolvedCompetitorGroup;
import com.cruxpass.enums.PricingRuleType;
import java.util.List;

public record ResolvedPricingRuleDto(
    Long id,
    PricingRuleType ruleType,
    List<ResolvedCompetitorGroup> groups,
    Integer minAge,
    Integer maxAge,
    Integer amount,
    Integer priority
) {}

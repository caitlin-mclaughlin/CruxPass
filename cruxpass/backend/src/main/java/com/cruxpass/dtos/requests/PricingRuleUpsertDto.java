package com.cruxpass.dtos.requests;

import com.cruxpass.enums.PricingRuleType;
import com.cruxpass.models.GroupRefs.GroupRef;
import java.util.Set;

public record PricingRuleUpsertDto(
    Long id,
    PricingRuleType ruleType,
    Set<GroupRef> groups,
    Integer minAge,
    Integer maxAge,
    Integer amount,
    Integer priority
) {}

package com.cruxpass.dtos;

import com.cruxpass.models.AgeRule;

public record ResolvedCompetitorGroup(
    Long id,          // null for default groups
    String name,
    AgeRule ageRule
) {}

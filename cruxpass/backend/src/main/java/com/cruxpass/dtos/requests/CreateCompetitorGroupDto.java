package com.cruxpass.dtos.requests;

import com.cruxpass.models.AgeRule;

public record CreateCompetitorGroupDto(
    Long ownerId,
    String clientId,
    String name,
    boolean constrained,
    AgeRule ageRule
) {}

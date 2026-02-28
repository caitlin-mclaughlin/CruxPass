package com.cruxpass.dtos;

import com.cruxpass.dtos.requests.CreateCompetitorGroupDto;
import com.cruxpass.models.AgeRule;

public record CompetitorGroupDto(
    Long id,
    Long ownerId,
    String name,
    boolean constrained,
    AgeRule ageRule
) {
    public CompetitorGroupDto(Long id, CreateCompetitorGroupDto create) {
        this(
            id,
            create.ownerId(),
            create.name(),
            create.constrained(),
            create.ageRule()
        );
    }
}

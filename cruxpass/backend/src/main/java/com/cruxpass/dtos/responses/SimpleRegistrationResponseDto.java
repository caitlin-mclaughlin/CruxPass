package com.cruxpass.dtos.responses;

import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Gender;

public record SimpleRegistrationResponseDto(
    Long id,
    Long compId,
    CompetitorGroup competitorGroup,
    Gender division,
    String climberName
) {}

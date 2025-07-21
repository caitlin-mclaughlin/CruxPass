package com.cruxpass.dtos.responses;

import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Gender;

public record RegistrationResponseDto(
    Long id,
    Long gymId,
    Long compId,
    CompetitorGroup competitorGroup,
    Gender gender,
    String climberName,
    String email,
    boolean paid
) {}

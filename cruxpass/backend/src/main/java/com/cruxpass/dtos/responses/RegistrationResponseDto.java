package com.cruxpass.dtos.responses;

import com.cruxpass.enums.CompetitorGroup;

public record RegistrationResponseDto(
    Long id,
    Long gymId,
    Long compId,
    CompetitorGroup competitorGroup,
    String climberName,
    String email,
    boolean paid
) {}

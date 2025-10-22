package com.cruxpass.dtos.responses;

import java.time.LocalDate;

import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Division;

public record RegistrationResponseDto(
    Long id,
    Long gymId,
    Long compId,
    String climberName,
    LocalDate climberDob,
    String climberEmail,
    CompetitorGroup competitorGroup,
    Division division,
    boolean paid
) {}

package com.cruxpass.dtos.responses;

import java.time.LocalDate;

import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.Division;

public record SimpleRegistrationResponseDto(
    Long id,
    Long compId,
    String climberName,
    LocalDate climberDob,
    String climberEmail,
    DefaultCompetitorGroup competitorGroup,
    Division division
) {}

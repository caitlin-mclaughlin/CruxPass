package com.cruxpass.dtos.responses;

import java.time.LocalDate;

import com.cruxpass.dtos.ResolvedCompetitorGroup;
import com.cruxpass.enums.Division;

public record SimpleRegistrationResponseDto(
    Long id,
    Long compId,
    String climberName,
    LocalDate climberDob,
    String climberEmail,
    ResolvedCompetitorGroup competitorGroup,
    Division division,
    ResolvedHeatDto heat,
    Integer feeamount,
    String feeCurrency
) {}

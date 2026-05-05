package com.cruxpass.dtos.responses;

import java.time.LocalDate;

import com.cruxpass.dtos.ResolvedCompetitorGroup;
import com.cruxpass.enums.Division;

public record RegistrationResponseDto(
    Long id,
    Long gymId,
    Long compId,
    String climberName,
    LocalDate climberDob,
    String climberEmail,
    ResolvedCompetitorGroup competitorGroup,
    Division division,
    ResolvedHeatDto heat,
    Integer feeamount,
    String feeCurrency,
    boolean paid
) {}

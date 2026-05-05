package com.cruxpass.dtos.requests;

import java.time.LocalDate;

import com.cruxpass.dtos.ResolvedCompetitorGroup;
import com.cruxpass.dtos.responses.ResolvedHeatDto;
import com.cruxpass.enums.Division;

public record CompRegistrationRequestDto(
    String climberName,
    String email,
    LocalDate dob,
    ResolvedCompetitorGroup competitorGroup,
    Division division,
    ResolvedHeatDto heat,
    boolean paid
) {}

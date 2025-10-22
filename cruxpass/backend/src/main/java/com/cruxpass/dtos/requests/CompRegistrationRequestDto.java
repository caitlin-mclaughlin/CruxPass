package com.cruxpass.dtos.requests;

import java.time.LocalDate;

import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Division;

public record CompRegistrationRequestDto(
    String climberName,
    String email,
    LocalDate dob,
    CompetitorGroup competitorGroup,
    Division division,
    boolean paid
) {}

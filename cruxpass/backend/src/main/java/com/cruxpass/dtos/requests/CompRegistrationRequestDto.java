package com.cruxpass.dtos.requests;

import java.time.LocalDate;

import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.Division;

public record CompRegistrationRequestDto(
    String climberName,
    String email,
    LocalDate dob,
    DefaultCompetitorGroup competitorGroup,
    Division division,
    boolean paid
) {}

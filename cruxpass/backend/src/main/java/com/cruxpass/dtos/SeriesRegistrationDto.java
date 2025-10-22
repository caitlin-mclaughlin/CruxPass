package com.cruxpass.dtos;

import com.cruxpass.enums.Division;

public record SeriesRegistrationDto(
    Long seriesId,
    Long climberId,
    String climberName,
    int birthYear,
    Division division
) {} 
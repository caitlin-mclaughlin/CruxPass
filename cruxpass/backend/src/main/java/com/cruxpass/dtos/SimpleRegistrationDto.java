package com.cruxpass.dtos;

import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Gender;

public record SimpleRegistrationDto(
    Gender division,
    CompetitorGroup competitorGroup
) {}

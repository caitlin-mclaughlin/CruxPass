package com.cruxpass.dtos;

import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.Division;

public record SimpleRegistrationDto(
    Division division,
    DefaultCompetitorGroup competitorGroup
) {}

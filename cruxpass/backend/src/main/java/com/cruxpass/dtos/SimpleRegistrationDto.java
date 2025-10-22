package com.cruxpass.dtos;

import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Division;

public record SimpleRegistrationDto(
    Division division,
    CompetitorGroup competitorGroup
) {}

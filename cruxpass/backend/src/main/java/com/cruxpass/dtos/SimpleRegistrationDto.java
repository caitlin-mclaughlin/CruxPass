package com.cruxpass.dtos;

import com.cruxpass.dtos.responses.ResolvedHeatDto;
import com.cruxpass.enums.Division;

public record SimpleRegistrationDto(
    Division division,
    ResolvedCompetitorGroup compGroup,
    ResolvedHeatDto heat
) {}

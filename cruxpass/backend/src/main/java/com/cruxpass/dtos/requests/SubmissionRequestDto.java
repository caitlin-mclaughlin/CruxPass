package com.cruxpass.dtos.requests;

import com.cruxpass.dtos.SubmittedRouteDto;
import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.Division;

import java.util.List;

public record SubmissionRequestDto(
    DefaultCompetitorGroup competitorGroup,
    Division division,
    List<SubmittedRouteDto> routes
) {}
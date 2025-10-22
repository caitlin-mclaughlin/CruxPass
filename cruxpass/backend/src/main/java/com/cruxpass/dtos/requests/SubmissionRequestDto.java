package com.cruxpass.dtos.requests;

import com.cruxpass.dtos.SubmittedRouteDto;
import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Division;

import java.util.List;

public record SubmissionRequestDto(
    CompetitorGroup competitorGroup,
    Division division,
    List<SubmittedRouteDto> routes
) {}
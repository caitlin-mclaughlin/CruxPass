package com.cruxpass.dtos.requests;

import com.cruxpass.dtos.SubmittedRouteDto;
import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Gender;

import java.util.List;

public record SubmissionRequestDto(
    CompetitorGroup competitorGroup,
    Gender division,
    List<SubmittedRouteDto> routes
) {}
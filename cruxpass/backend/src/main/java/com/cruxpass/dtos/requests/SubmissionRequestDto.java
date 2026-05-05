package com.cruxpass.dtos.requests;

import com.cruxpass.dtos.SubmittedRouteDto;
import java.util.List;

public record SubmissionRequestDto(
    List<SubmittedRouteDto> routes
) {}

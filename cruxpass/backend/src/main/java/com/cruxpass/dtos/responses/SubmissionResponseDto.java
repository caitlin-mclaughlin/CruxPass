package com.cruxpass.dtos.responses;

import com.cruxpass.dtos.SubmittedRouteDto;
import java.util.List;

public record SubmissionResponseDto(
    Long submissionId,
    Long competitionId,
    Long climberId,
    List<SubmittedRouteDto> submittedRoutes
) {}

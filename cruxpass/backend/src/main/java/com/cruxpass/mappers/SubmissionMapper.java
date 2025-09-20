package com.cruxpass.mappers;

import com.cruxpass.dtos.SubmittedRouteDto;
import com.cruxpass.dtos.responses.SubmissionResponseDto;
import com.cruxpass.dtos.responses.SubmittedRouteResponseDto;
import com.cruxpass.models.Submission;
import com.cruxpass.models.SubmittedRoute;

import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class SubmissionMapper {

    public SubmissionResponseDto toSubmissionResponseDto(Submission submission) {
        List<SubmittedRouteDto> routeDtos = submission.getRoutes().stream()
            .map(this::toSubmittedRouteDto)
            .toList();

        return new SubmissionResponseDto(
            submission.getId(),
            submission.getCompetition().getId(),
            submission.getClimber().getId(),
            routeDtos
        );
    }

    public SubmittedRouteDto toSubmittedRouteDto(SubmittedRoute route) {
        return new SubmittedRouteDto(
            route.getRoute().getId(),
            route.getAttempts(),
            route.isSend()
        );
    }

    public SubmittedRouteResponseDto toSubmittedRouteResponseDto(SubmittedRoute route) {
        return new SubmittedRouteResponseDto(
            route.getRoute().getId(),
            route.getRoute().getNumber(),
            route.getRoute().getPointValue(),
            route.getAttempts(),
            route.isSend()
        );
    }
}

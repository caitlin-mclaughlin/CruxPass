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

    public SubmissionResponseDto toSubmissionResponseDto(Submission sub) {
        if (sub == null) return null;
        List<SubmittedRouteDto> routeDtos = sub.getRoutes().stream()
            .map(this::toSubmittedRouteDto)
            .toList();

        return new SubmissionResponseDto(
            sub.getId(),
            sub.getCompetition().getId(),
            sub.getClimber().getId(),
            routeDtos
        );
    }

    public SubmittedRouteDto toSubmittedRouteDto(SubmittedRoute route) {
        if (route == null) return null;
        return new SubmittedRouteDto(
            route.getRoute().getId(),
            route.getAttempts(),
            route.isSend()
        );
    }

    public SubmittedRouteResponseDto toSubmittedRouteResponseDto(SubmittedRoute route) {
        if (route == null) return null;
        return new SubmittedRouteResponseDto(
            route.getRoute().getId(),
            route.getRoute().getNumber(),
            route.getRoute().getPointValue(),
            route.getAttempts(),
            route.isSend()
        );
    }
}

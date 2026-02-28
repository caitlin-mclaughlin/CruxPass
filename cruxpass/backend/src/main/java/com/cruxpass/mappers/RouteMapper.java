package com.cruxpass.mappers;

import com.cruxpass.dtos.requests.RouteUpsertDto;
import com.cruxpass.dtos.responses.RouteResponseDto;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Route;

import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class RouteMapper {

    /** Map Route entity -> Response DTO */
    public RouteResponseDto toResponseDto(Route route) {
        if (route == null) return null;
        return new RouteResponseDto(
            route.getId(),
            route.getNumber(),
            route.getPointValue(),
            route.getGrade()
        );
    }

    /** Map Route DTO -> Route entity for creation, linking Competition + Gym */
    public Route toEntity(RouteUpsertDto dto, Gym gym, Competition competition) {
        if (dto == null || gym == null || competition == null) return null;
        Route route = new Route();
        route.setNumber(dto.number());
        route.setPointValue(dto.pointValue());
        route.setGrade(dto.grade());
        route.setGym(gym);
        route.setCompetition(competition);
        return route;
    }

    /** Map list of Route entities -> list of Response DTOs */
    public List<RouteResponseDto> toResponseDtoList(List<Route> routes) {
        return routes.stream()
                     .map(this::toResponseDto)
                     .toList();
    }

    /** Map list of Route DTOs -> list of Route entities */
    public List<Route> toEntityList(List<RouteUpsertDto> dtos, Gym gym, Competition comp) {
        return dtos.stream()
                   .map(dto -> toEntity(dto, gym, comp))
                   .toList();
    }
}

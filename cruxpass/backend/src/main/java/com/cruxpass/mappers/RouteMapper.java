package com.cruxpass.mappers;

import org.springframework.stereotype.Component;

import com.cruxpass.dtos.RouteDto;
import com.cruxpass.dtos.responses.RouteResponseDto;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Route;

import java.util.List;

@Component
public class RouteMapper {

    /** Map Route entity -> Response DTO */
    public RouteResponseDto toResponseDto(Route route) {
        if (route == null) return null;
        return new RouteResponseDto(
            route.getId(),
            route.getNumber(),
            route.getPointValue()
        );
    }

    /** Map Route DTO -> Route entity for creation, linking Competition + Gym */
    public Route toEntity(RouteDto dto, Gym gym, Competition competition) {
        Route route = new Route();
        route.setNumber(dto.number());
        route.setPointValue(dto.pointValue());
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
    public List<Route> toEntityList(List<RouteDto> dtos, Gym gym, Competition comp) {
        return dtos.stream()
                   .map(dto -> toEntity(dto, gym, comp))
                   .toList();
    }
}

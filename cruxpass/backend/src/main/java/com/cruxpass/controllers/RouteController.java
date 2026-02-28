package com.cruxpass.controllers;

import com.cruxpass.dtos.responses.RouteResponseDto;
import com.cruxpass.mappers.RouteMapper;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Route;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.CompetitionService;
import com.cruxpass.services.RouteService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/competitions/{competitionId}/routes")
public class RouteController {

    private final RouteService routeService;
    private final CompetitionService competitionService;

    @Autowired private RouteMapper routeMap;

    @GetMapping
    public ResponseEntity<List<RouteResponseDto>> getRoutes(
        @PathVariable Long competitionId,
        @RequestHeader("Authorization") String authHeader
    ) {
            
        Competition comp = competitionService.getById(competitionId);
        if (comp == null) return ResponseEntity.notFound().build();

        List<Route> routes = routeService.getByCompetitionId(competitionId);
        if (routes == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(routeMap.toResponseDtoList(routes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RouteResponseDto> getById(
        @PathVariable Long id,
        @PathVariable Long competitionId,
        @RequestHeader("Authorization") String authHeader
    ) {
        Route route = routeService.getById(id);
        if (route == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(routeMap.toResponseDto(route));
    }
}
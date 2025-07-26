package com.cruxpass.controllers;

import com.cruxpass.dtos.RouteDto;
import com.cruxpass.dtos.responses.RouteResponseDto;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Route;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.CompetitionService;
import com.cruxpass.services.GymService;
import com.cruxpass.services.RouteService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/gyms/{gymId}/competitions/{competitionId}/routes")
public class CompRouteController {

    private final RouteService routeService;
    private final GymService gymService;
    private final CompetitionService competitionService;
    private final CurrentUserService currentUserService;

    public CompRouteController(RouteService routeService, GymService gymService,
            CompetitionService competitionService, CurrentUserService currentUserService) {
        this.routeService = routeService;
        this.gymService = gymService;
        this.competitionService = competitionService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public ResponseEntity<List<RouteResponseDto>> getAll(
        @PathVariable Long gymId,
        @PathVariable Long competitionId,
        @RequestHeader("Authorization") String authHeader
    ) {
        currentUserService.validateGymAccess(gymId, authHeader);
        List<Route> routes = routeService.getAll();
        if (routes == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(routes.stream()
            .map(route ->
                new RouteResponseDto(
                    route.getId(),
                    route.getCompetition().getId(),
                    route.getNumber(),
                    route.getPointValue()
                )
            ).toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<RouteResponseDto> getById(
        @PathVariable Long id,
        @PathVariable Long gymId,
        @PathVariable Long competitionId,
        @RequestHeader("Authorization") String authHeader
    ) {
        currentUserService.validateGymAccess(gymId, authHeader);
        Route route = routeService.getById(id);
        if (route == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(new RouteResponseDto(
            gymId,
            competitionId,
            route.getNumber(),
            route.getPointValue())
        );
    }

    @PutMapping()
    public ResponseEntity<List<RouteResponseDto>> createRoutes(
        @PathVariable Long gymId,
        @PathVariable Long competitionId,
        @RequestBody List<RouteDto> routes,
        @RequestHeader("Authorization") String authHeader
    ) {
        currentUserService.validateGymAccess(gymId, authHeader);

        Gym gym = gymService.getById(gymId);
        if (gym == null) return ResponseEntity.notFound().build();
        Competition comp = competitionService.getById(competitionId);
        if (comp == null) return ResponseEntity.notFound().build();

        List<Route> newRoutes = routeService.getByGymAndCompetition(gym, comp);
        if (newRoutes == null) return ResponseEntity.notFound().build();
        
        return ResponseEntity.ok(newRoutes.stream().map(route ->
            new RouteResponseDto(
                route.getId(),
                route.getCompetition().getId(),
                route.getNumber(),
                route.getPointValue() 
            )
            ).toList()
        );
    }
}
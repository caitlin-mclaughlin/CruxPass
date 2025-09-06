package com.cruxpass.controllers;

import com.cruxpass.dtos.RouteDto;
import com.cruxpass.dtos.responses.RouteResponseDto;
import com.cruxpass.mappers.RouteMapper;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Route;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.CompetitionService;
import com.cruxpass.services.GymService;
import com.cruxpass.services.RouteService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

    @Autowired
    private RouteMapper routeMap;

    public CompRouteController(RouteService routeService, GymService gymService,
            CompetitionService competitionService, CurrentUserService currentUserService) {
        this.routeService = routeService;
        this.gymService = gymService;
        this.competitionService = competitionService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public ResponseEntity<List<RouteResponseDto>> getRoutes(
        @PathVariable Long gymId,
        @PathVariable Long competitionId,
        @RequestHeader("Authorization") String authHeader
    ) {
        currentUserService.validateGymAccess(gymId, authHeader);
            
        Competition comp = competitionService.getById(competitionId).orElse(null);
        if (comp == null) return ResponseEntity.notFound().build();
        if (comp.getGym().getId() != gymId)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<Route> routes = routeService.getByCompetitionId(competitionId);
        if (routes == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(routeMap.toResponseDtoList(routes));
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

        return ResponseEntity.ok(routeMap.toResponseDto(route));
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
        Competition comp = competitionService.getById(competitionId).orElse(null);
        if (comp == null) return ResponseEntity.notFound().build();
        if (comp.getGym().getId() != gym.getId())
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<Route> newRoutes = routeService.saveOrUpdateRoutes(
            routeMap.toEntityList(routes, gym, comp)
        );

        if (newRoutes == null) return ResponseEntity.notFound().build();
        
        return ResponseEntity.ok(routeMap.toResponseDtoList(newRoutes));
    }
}
package com.cruxpass.controllers;

import com.cruxpass.models.Route;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.RouteService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gyms/{gymId}/competitions/{competitionId}/routes")
public class CompRouteController {

    private final CurrentUserService currentUserService;
    private final RouteService service;

    public CompRouteController(CurrentUserService currentUserService, RouteService service) {
        this.currentUserService = currentUserService;
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Route>> getAll(
        @PathVariable Long gymId,
        @PathVariable Long competitionId,
        @RequestHeader("Authorization") String authHeader
    ) {
        currentUserService.validateGymAccess(gymId, authHeader);
        List<Route> routes = service.getAll();
        if (routes == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(routes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Route> getById(
        @PathVariable Long id,
        @PathVariable Long gymId,
        @PathVariable Long competitionId,
        @RequestHeader("Authorization") String authHeader
    ) {
        currentUserService.validateGymAccess(gymId, authHeader);
        Route route = service.getById(id);
        if (route == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(route);
    }
}
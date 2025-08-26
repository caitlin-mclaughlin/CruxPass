package com.cruxpass.services;

import com.cruxpass.dtos.RouteDto;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Route;
import com.cruxpass.repositories.RouteRepository;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RouteService {
    
    private final RouteRepository repository;

    public RouteService(RouteRepository repository) {
        this.repository = repository;
    }

    public List<Route> getAll() {
        return repository.findAll();
    }

    @Cacheable(value = "routes", key = "#competitionId")
    public List<Route> getByCompetitionId(Long competitionId) {
        return repository.findByCompetitionId(competitionId).orElse(null);
    }

    public Route getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    @Transactional
    public Route save(Route route) {
        return repository.save(route);
    }

    @Transactional
    @CacheEvict(value = "routes", key = "#routes.get(0).competition.id")
    public List<Route> saveOrUpdateRoutes(List<Route> routes) {
        if (routes == null || routes.isEmpty()) return List.of();

        Competition competition = routes.get(0).getCompetition();
        if (competition.getCompStatus() != CompetitionStatus.UPCOMING) {
            throw new IllegalStateException("Cannot modify routes after competition has started.");
        }

        List<Route> existing = getByCompetitionId(competition.getId());

        if (existing == null || existing.isEmpty()) {
            // Save all new routes
            return repository.saveAll(routes);
        }

        // Map existing routes by number
        Map<Integer, Route> existingByNumber = existing.stream()
            .collect(Collectors.toMap(Route::getNumber, r -> r));

        List<Route> updatedRoutes = new ArrayList<>();

        for (Route route : routes) {
            Route existingRoute = existingByNumber.get(route.getNumber());
            if (existingRoute == null) {
                // New route
                updatedRoutes.add(route);
            } else {
                // Update existing route
                existingRoute.setPointValue(route.getPointValue());
                updatedRoutes.add(existingRoute);
            }
        }

        // Delete removed routes
        Set<Integer> incomingNumbers = routes.stream().map(Route::getNumber).collect(Collectors.toSet());
        List<Route> toDelete = existing.stream()
            .filter(r -> !incomingNumbers.contains(r.getNumber()))
            .toList();
        repository.deleteAll(toDelete);

        return repository.saveAll(updatedRoutes);
    }

}

package com.cruxpass.services;

import com.cruxpass.dtos.requests.RouteUpsertDto;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Route;
import com.cruxpass.repositories.CompetitionRepository;
import com.cruxpass.repositories.RouteRepository;

import lombok.AllArgsConstructor;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class RouteService {
    
    private final RouteRepository routeRepo;
    private final CompetitionRepository compRepo;

    @Cacheable(value = "routes", key = "#competitionId")
    public List<Route> getAll() {
        return routeRepo.findAll();
    }

    @Cacheable(value = "routes", key = "#competitionId")
    public Route getById(Long id) {
        return routeRepo.findById(id).orElse(null);
    }

    @Cacheable(value = "routes", key = "#competitionId")
    public List<Route> getByCompetitionId(Long competitionId) {
        return routeRepo.findByCompetitionId(competitionId).orElse(null);
    }

    private void syncRoutes(Competition comp, List<RouteUpsertDto> dtos) {
        Map<Integer, Route> existing =
            comp.getRoutes().stream()
                .collect(Collectors.toMap(Route::getNumber, r -> r));

        List<Route> newList = new ArrayList<>();

        for (RouteUpsertDto dto : dtos) {
            Route route = existing.remove(dto.number());

            if (route == null) {
                route = new Route();
                route.setCompetition(comp);
                route.setNumber(dto.number());
            }

            route.setPointValue(dto.pointValue());
            newList.add(route);
        }

        comp.getRoutes().clear();
        comp.getRoutes().addAll(newList);
    }

    @CacheEvict(value = "routes", key = "#competitionId")
    @Transactional
    public List<Route> upsertRoutes(
        Gym gym,
        Long competitionId,
        List<RouteUpsertDto> dtos
    ) {
        Competition comp = compRepo.findByIdAndGymId(competitionId, gym.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN));

        if (comp.getCompStatus() != CompetitionStatus.UPCOMING) {
            throw new IllegalStateException("Cannot modify routes after competition has started.");
        }

        syncRoutes(comp, dtos);
        return comp.getRoutes();
    }


}

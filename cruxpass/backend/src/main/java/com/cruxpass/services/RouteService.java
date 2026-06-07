package com.cruxpass.services;

import com.cruxpass.dtos.requests.RouteUpsertDto;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.enums.BoulderGrade;
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
import java.time.LocalDateTime;
import java.time.ZoneId;
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
        return routeRepo.findByCompetitionId(competitionId)
            .map(routes -> routes.stream()
                .sorted((a, b) -> Integer.compare(a.getNumber(), b.getNumber()))
                .toList())
            .orElse(List.of());
    }

    private void syncRoutes(Competition comp, List<RouteUpsertDto> dtos) {
        if (dtos == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Routes list is required.");
        }

        Map<Integer, Long> duplicates = dtos.stream()
            .collect(Collectors.groupingBy(RouteUpsertDto::number, Collectors.counting()));
        if (duplicates.values().stream().anyMatch(count -> count > 1)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate route numbers are not allowed.");
        }

        Map<Integer, Route> existing =
            comp.getRoutes().stream()
                .collect(Collectors.toMap(Route::getNumber, r -> r));

        List<Route> newList = dtos.stream()
            .peek(dto -> {
                if (dto.number() <= 0 || dto.pointValue() < 0) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Route number and point value must be non-negative.");
                }
            })
            .map(dto -> {
                Route route = existing.remove(dto.number());

                if (route == null) {
                    route = new Route();
                    route.setCompetition(comp);
                    route.setGym(comp.getGym());
                    route.setNumber(dto.number());
                }

                route.setPointValue(dto.pointValue());
                route.setGrade(dto.grade() == null ? BoulderGrade.UNGRADED : dto.grade());
                return route;
            })
            .sorted((a, b) -> Integer.compare(a.getNumber(), b.getNumber()))
            .toList();

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

        syncRoutes(comp, dtos);
        return comp.getRoutes();
    }


}

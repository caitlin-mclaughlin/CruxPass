package com.cruxpass.services;

import com.cruxpass.models.Competition;
import com.cruxpass.models.Route;
import com.cruxpass.repositories.RouteRepository;
import org.junit.jupiter.api.Test;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RouteServiceTest {

    @Test
    void getByCompetitionIdDelegatesToRepository() {
        RouteRepository repo = mock(RouteRepository.class);
        RouteService svc = new RouteService(repo);
        Competition comp = new Competition();
        when(repo.findByCompetitionId(comp.getId())).thenReturn(Collections.emptyList());

        // safe call: should not throw
        assertNotNull(svc.getByCompetitionId(comp.getId()));
    }
}
package com.cruxpass.services;

import static com.cruxpass.support.TestFixtures.competition;
import static com.cruxpass.support.TestFixtures.gym;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.cruxpass.dtos.requests.RouteUpsertDto;
import com.cruxpass.enums.BoulderGrade;
import com.cruxpass.enums.PricingType;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Route;
import com.cruxpass.repositories.CompetitionRepository;
import com.cruxpass.repositories.RouteRepository;

import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RouteServiceTest {

    @Mock
    private RouteRepository routeRepo;

    @Mock
    private CompetitionRepository compRepo;

    @InjectMocks
    private RouteService routeService;

    @Test
    void upsertRoutesCreatesRoutesWithCompetitionGymGradeAndSortedOrder() {
        Gym gym = gym(10L);
        Competition competition = competition(PricingType.FLAT);
        competition.setId(50L);
        competition.setGym(gym);

        when(compRepo.findByIdAndGymId(50L, 10L)).thenReturn(Optional.of(competition));

        List<Route> routes = routeService.upsertRoutes(
            gym,
            50L,
            List.of(
                new RouteUpsertDto(2, 120, BoulderGrade.V4),
                new RouteUpsertDto(1, 0, null)
            )
        );

        assertEquals(List.of(1, 2), routes.stream().map(Route::getNumber).toList());
        assertEquals(List.of(BoulderGrade.UNGRADED, BoulderGrade.V4), routes.stream().map(Route::getGrade).toList());
        assertEquals(List.of(0, 120), routes.stream().map(Route::getPointValue).toList());
        routes.forEach(route -> {
            assertSame(gym, route.getGym());
            assertSame(competition, route.getCompetition());
        });
    }

    @Test
    void upsertRoutesUpdatesMatchingNumbersAndRemovesOmittedRoutes() {
        Gym gym = gym(10L);
        Competition competition = competition(PricingType.FLAT);
        competition.setId(50L);
        competition.setGym(gym);

        Route routeOne = route(101L, 1, 50, BoulderGrade.V1, gym, competition);
        Route routeTwo = route(102L, 2, 80, BoulderGrade.V2, gym, competition);
        competition.getRoutes().addAll(List.of(routeOne, routeTwo));

        when(compRepo.findByIdAndGymId(50L, 10L)).thenReturn(Optional.of(competition));

        List<Route> routes = routeService.upsertRoutes(
            gym,
            50L,
            List.of(
                new RouteUpsertDto(2, 100, BoulderGrade.V5),
                new RouteUpsertDto(3, 140, BoulderGrade.V6)
            )
        );

        assertEquals(List.of(2, 3), routes.stream().map(Route::getNumber).toList());
        assertSame(routeTwo, routes.get(0));
        assertEquals(102L, routes.get(0).getId());
        assertEquals(100, routes.get(0).getPointValue());
        assertEquals(BoulderGrade.V5, routes.get(0).getGrade());
        assertEquals(List.of(2, 3), competition.getRoutes().stream().map(Route::getNumber).toList());
    }

    @Test
    void upsertRoutesAllowsEmptyListToClearRoutes() {
        Gym gym = gym(10L);
        Competition competition = competition(PricingType.FLAT);
        competition.setId(50L);
        competition.setGym(gym);
        competition.getRoutes().add(route(101L, 1, 50, BoulderGrade.V1, gym, competition));

        when(compRepo.findByIdAndGymId(50L, 10L)).thenReturn(Optional.of(competition));

        List<Route> routes = routeService.upsertRoutes(gym, 50L, List.of());

        assertEquals(List.of(), routes);
        assertEquals(List.of(), competition.getRoutes());
    }

    @Test
    void upsertRoutesRejectsDuplicateRouteNumbersBeforeMutatingCompetition() {
        Gym gym = gym(10L);
        Competition competition = competition(PricingType.FLAT);
        competition.setId(50L);
        competition.setGym(gym);
        competition.getRoutes().add(route(101L, 1, 50, BoulderGrade.V1, gym, competition));

        when(compRepo.findByIdAndGymId(50L, 10L)).thenReturn(Optional.of(competition));

        ResponseStatusException ex = assertThrows(
            ResponseStatusException.class,
            () -> routeService.upsertRoutes(
                gym,
                50L,
                List.of(
                    new RouteUpsertDto(1, 50, BoulderGrade.V1),
                    new RouteUpsertDto(1, 100, BoulderGrade.V2)
                )
            )
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals(List.of(1), competition.getRoutes().stream().map(Route::getNumber).toList());
    }

    @Test
    void upsertRoutesRejectsInvalidRouteValues() {
        Gym gym = gym(10L);
        Competition competition = competition(PricingType.FLAT);
        competition.setId(50L);
        competition.setGym(gym);

        when(compRepo.findByIdAndGymId(50L, 10L)).thenReturn(Optional.of(competition));

        assertBadRequest(() -> routeService.upsertRoutes(gym, 50L, null));
        assertBadRequest(() -> routeService.upsertRoutes(gym, 50L, List.of(new RouteUpsertDto(0, 50, BoulderGrade.V1))));
        assertBadRequest(() -> routeService.upsertRoutes(gym, 50L, List.of(new RouteUpsertDto(1, -1, BoulderGrade.V1))));
    }

    @Test
    void upsertRoutesRejectsCompetitionsOutsideGym() {
        Gym gym = gym(10L);
        when(compRepo.findByIdAndGymId(50L, 10L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(
            ResponseStatusException.class,
            () -> routeService.upsertRoutes(gym, 50L, List.of(new RouteUpsertDto(1, 50, BoulderGrade.V1)))
        );

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void getByCompetitionIdReturnsRoutesSortedByNumberAndEmptyWhenMissing() {
        Competition competition = competition(PricingType.FLAT);
        Gym gym = gym(10L);

        when(routeRepo.findByCompetitionId(50L)).thenReturn(Optional.of(List.of(
            route(102L, 2, 100, BoulderGrade.V2, gym, competition),
            route(101L, 1, 50, BoulderGrade.V1, gym, competition)
        )));
        when(routeRepo.findByCompetitionId(60L)).thenReturn(Optional.empty());

        assertEquals(List.of(1, 2), routeService.getByCompetitionId(50L).stream().map(Route::getNumber).toList());
        assertEquals(List.of(), routeService.getByCompetitionId(60L));
    }

    private void assertBadRequest(Runnable runnable) {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, runnable::run);
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    private Route route(
        Long id,
        int number,
        int pointValue,
        BoulderGrade grade,
        Gym gym,
        Competition competition
    ) {
        Route route = new Route();
        route.setId(id);
        route.setNumber(number);
        route.setPointValue(pointValue);
        route.setGrade(grade);
        route.setGym(gym);
        route.setCompetition(competition);
        return route;
    }
}

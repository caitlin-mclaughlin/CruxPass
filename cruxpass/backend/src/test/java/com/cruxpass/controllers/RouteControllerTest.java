package com.cruxpass.controllers;

import com.cruxpass.mappers.RouteMapper;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Route;
import com.cruxpass.services.RouteService;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RouteControllerTest {

    @Test
    void getRoutesReturnsNotFoundWhenServiceReturnsNull() {
        RouteService svc = mock(RouteService.class);
        RouteMapper mapper = mock(RouteMapper.class);
        RouteController ctrl = new RouteController(svc);
        ctrl.routeMap = mapper;

        when(svc.getByCompetitionId(1L)).thenReturn(null);

        ResponseEntity<List<?>> resp = ctrl.getRoutes(1L);
        assertEquals(404, resp.getStatusCode().value());
    }

    @Test
    void getByIdReturnsNotFoundWhenRouteMissingOrMismatch() {
        RouteService svc = mock(RouteService.class);
        RouteMapper mapper = mock(RouteMapper.class);
        RouteController ctrl = new RouteController(svc);
        ctrl.routeMap = mapper;

        when(svc.getById(10L)).thenReturn(null);
        ResponseEntity<?> resp = ctrl.getById(10L, 1L);
        assertEquals(404, resp.getStatusCode().value());

        // route exists but competition mismatch
        Route r = new Route();
        Competition c = new Competition();
        c.setId(2L);
        r.setCompetition(c);
        when(svc.getById(11L)).thenReturn(r);

        ResponseEntity<?> resp2 = ctrl.getById(11L, 1L);
        assertEquals(404, resp2.getStatusCode().value());
    }
}

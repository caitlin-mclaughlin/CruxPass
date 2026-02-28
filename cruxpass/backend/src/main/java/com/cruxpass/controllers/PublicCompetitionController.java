package com.cruxpass.controllers;

import com.cruxpass.dtos.SimpleRegistrationDto;
import com.cruxpass.dtos.responses.CompetitionResponseDto;
import com.cruxpass.dtos.responses.RouteResponseDto;
import com.cruxpass.mappers.CompetitionMapper;
import com.cruxpass.mappers.RouteMapper;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Registration;
import com.cruxpass.models.Route;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.CompetitionService;
import com.cruxpass.services.RegistrationService;
import com.cruxpass.services.RouteService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/competitions")
public class PublicCompetitionController {

    private final CurrentUserService currentUserService;
    private final CompetitionService competitionService;
    private final RegistrationService registrationService;
    private final RouteService routeService;

    @Autowired
    private CompetitionMapper compMap;
    @Autowired
    private RouteMapper routeMap;

    @GetMapping
    public ResponseEntity<List<CompetitionResponseDto>> getAllCompetitions(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        final Climber climber = (authHeader != null && !authHeader.isBlank())
            ? currentUserService.getClimberFromToken(authHeader)
            : null;

        List<Competition> competitions = competitionService.getAllWithHeats();

        return ResponseEntity.ok(
            competitions.stream()
                .map(comp -> {
                    Registration reg = climber != null
                        ? registrationService.getByClimberAndCompetition(climber, comp)
                        : null;
                    SimpleRegistrationDto simpleReg = reg != null
                        ? new SimpleRegistrationDto(reg.getDivision(), reg.getCompetitorGroup())
                        : null;

                    return compMap.toResponseDto(comp, reg != null, simpleReg);
                })
                .toList()
        );
    }

    @GetMapping("/{compId}")
    public ResponseEntity<CompetitionResponseDto> getById(
        @PathVariable Long compId,
        @RequestHeader("Authorization") String authHeader
    ) {
        final Climber climber = (authHeader != null && !authHeader.isBlank())
            ? currentUserService.getClimberFromToken(authHeader)
            : null;

        Competition comp = competitionService.getByIdWithHeats(compId);

        Registration reg = climber != null ?
            registrationService.getByClimberAndCompetition(climber, comp) : null;
        SimpleRegistrationDto simpleReg = reg != null ?
            new SimpleRegistrationDto(reg.getDivision(), reg.getCompetitorGroup()) : null;

        return ResponseEntity.ok(compMap.toResponseDto(comp, reg != null, simpleReg));
    }

    @GetMapping("/{compId}/routes")
    public ResponseEntity<List<RouteResponseDto>> getRoutes(
        @PathVariable Long compId,
        @RequestHeader("Authorization") String authHeader
    ) {
        Competition comp = competitionService.getById(compId);
        if (comp == null) return ResponseEntity.notFound().build();

        List<Route> routes = routeService.getByCompetitionId(compId);
        if (routes == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(routeMap.toResponseDtoList(routes));
    }
}


package com.cruxpass.controllers;

import com.cruxpass.dtos.RankedSubmissionDto;
import com.cruxpass.dtos.SimpleRegistrationDto;
import com.cruxpass.dtos.responses.CompetitionResponseDto;
import com.cruxpass.dtos.responses.RouteResponseDto;
import com.cruxpass.dtos.responses.SimpleRegistrationResponseDto;
import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Division;
import com.cruxpass.mappers.CompetitionMapper;
import com.cruxpass.mappers.RegistrationMapper;
import com.cruxpass.mappers.RouteMapper;
import com.cruxpass.mappers.SubmissionMapper;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Registration;
import com.cruxpass.models.Route;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.CompetitionService;
import com.cruxpass.services.RegistrationService;
import com.cruxpass.services.RouteService;
import com.cruxpass.services.SubmissionService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/competitions")
public class PublicCompetitionController {

    private final CurrentUserService currentUserService;
    private final CompetitionService competitionService;
    private final RegistrationService registrationService;
    private final RouteService routeService;
    private final SubmissionService submissionService;

    @Autowired
    private CompetitionMapper compMap;
    @Autowired
    private RegistrationMapper regMap;
    @Autowired
    private RouteMapper routeMap;
    @Autowired
    private SubmissionMapper subMap;

    public PublicCompetitionController(CurrentUserService currentUserService, CompetitionService competitionService, 
            RegistrationService registrationService, RouteService routeService, SubmissionService submissionService) {
        this.currentUserService = currentUserService;
        this.competitionService = competitionService;
        this.registrationService = registrationService;
        this.routeService = routeService;
        this.submissionService = submissionService;
    }

    @GetMapping
    public ResponseEntity<List<CompetitionResponseDto>> getAllCompetitions(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        final Climber climber = (authHeader != null && !authHeader.isBlank())
            ? currentUserService.getClimberFromToken(authHeader)
            : null;

        List<Competition> competitions = competitionService.getAll();
        if (competitions == null) return ResponseEntity.notFound().build();

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

    @GetMapping("/{competitionId}")
    public ResponseEntity<?> getById(
        @PathVariable Long competitionId,
        @RequestHeader("Authorization") String authHeader
    ) {
        final Climber climber = (authHeader != null && !authHeader.isBlank())
            ? currentUserService.getClimberFromToken(authHeader)
            : null;

        Competition comp = competitionService.getById(competitionId).orElse(null);
        if (comp == null) return ResponseEntity.notFound().build();

        Registration reg = climber != null ?
            registrationService.getByClimberAndCompetition(climber, comp) : null;
        SimpleRegistrationDto simpleReg = reg != null ?
            new SimpleRegistrationDto(reg.getDivision(), reg.getCompetitorGroup()) : null;

        return ResponseEntity.ok(compMap.toResponseDto(comp, reg != null, simpleReg));
    }

    @GetMapping("/{competitionId}/registrations")
    public ResponseEntity<List<SimpleRegistrationResponseDto>> getRegistrations(
        @PathVariable Long competitionId,
        @RequestHeader("Authorization") String authHeader
    ) {
        Competition comp = competitionService.getById(competitionId).orElse(null);
        if (comp == null) return ResponseEntity.notFound().build();

        List<Registration> regs = registrationService.getByCompetition(comp);
        if (regs == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(regs.stream()
            .map(reg -> regMap.toSimpleResponseDto(reg))
            .toList()
        );
    }

    @GetMapping("/{competitionId}/routes")
    public ResponseEntity<List<RouteResponseDto>> getRoutes(
        @PathVariable Long competitionId,
        @RequestHeader("Authorization") String authHeader
    ) {
        Competition comp = competitionService.getById(competitionId).orElse(null);
        if (comp == null) return ResponseEntity.notFound().build();

        List<Route> routes = routeService.getByCompetitionId(competitionId);
        if (routes == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(routeMap.toResponseDtoList(routes));
    }

    @GetMapping("/{competitionId}/rankings")
    public ResponseEntity<List<RankedSubmissionDto>> getLeaderboard(
        @PathVariable Long competitionId,
        @RequestParam CompetitorGroup group,
        @RequestParam(required = false) Division division
    ) {
        List<RankedSubmissionDto> rankings = submissionService.getRankingsByGroupAndDivision(competitionId, group, division);
        return rankings == null || rankings.isEmpty()
            ? ResponseEntity.noContent().build()
            : ResponseEntity.ok(rankings);
    }
}


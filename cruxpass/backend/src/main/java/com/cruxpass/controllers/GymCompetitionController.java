package com.cruxpass.controllers;

import com.cruxpass.annotations.CurrentGym;
import com.cruxpass.dtos.requests.CompetitionUpsertDto;
import com.cruxpass.dtos.requests.HeatUpsertDto;
import com.cruxpass.dtos.requests.RouteUpsertDto;
import com.cruxpass.dtos.responses.CompetitionResponseDto;
import com.cruxpass.dtos.responses.RegistrationResponseDto;
import com.cruxpass.dtos.responses.ResolvedCompetitionDto;
import com.cruxpass.dtos.responses.ResolvedHeatDto;
import com.cruxpass.dtos.responses.RouteResponseDto;
import com.cruxpass.mappers.CompetitionMapper;
import com.cruxpass.mappers.HeatMapper;
import com.cruxpass.mappers.RegistrationMapper;
import com.cruxpass.mappers.RouteMapper;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Heat;
import com.cruxpass.models.Registration;
import com.cruxpass.models.Route;
import com.cruxpass.services.CompetitionService;
import com.cruxpass.services.HeatService;
import com.cruxpass.services.RegistrationService;
import com.cruxpass.services.RouteService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/gyms/me/competitions")
public class GymCompetitionController {

    private final CompetitionService competitionService;
    private final HeatService heatService;
    private final RegistrationService registrationService;
    private final RouteService routeService;

    @Autowired private CompetitionMapper compMap;
    @Autowired private HeatMapper heatMap;
    @Autowired private RegistrationMapper regMap;
    @Autowired private RouteMapper routeMap;

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompetition(
        @PathVariable Long id,
        @CurrentGym Gym gym
    ) {
        competitionService.deleteCompetition(id);
        return ResponseEntity.noContent().build();
        
    }

    @GetMapping()
    public ResponseEntity<List<ResolvedCompetitionDto>> getAllCompetitionsForGym(
        @CurrentGym Gym gym
    ) {
        return ResponseEntity.ok(competitionService.getByGymWithHeats(gym));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResolvedCompetitionDto> getCompetition(
        @PathVariable Long id,
        @CurrentGym Gym gym
    ) {
        return ResponseEntity.ok(competitionService.getDtoByIdWithHeats(id, gym));
    }

    @PostMapping
    @PreAuthorize("hasRole('GYM')")
    public ResponseEntity<ResolvedCompetitionDto> createCompetition(
        @CurrentGym Gym gym,
        @RequestBody CompetitionUpsertDto dto
    ) {
        return ResponseEntity.ok(competitionService.createCompetition(gym, dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('GYM')")
    public ResponseEntity<ResolvedCompetitionDto> updateCompetition(
        @PathVariable Long id,
        @CurrentGym Gym gym,
        @RequestBody CompetitionUpsertDto dto
    ) {
        return ResponseEntity.ok(competitionService.updateCompetition(gym, id, dto));
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasRole('GYM')")
    public ResponseEntity<CompetitionResponseDto> startCompetition(
        @PathVariable Long id,
        @CurrentGym Gym gym
    ) {
        Competition comp = competitionService.getById(id);
        if (comp == null || !comp.getGym().getId().equals(gym.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Competition updated = competitionService.startCompetition(id);
        return ResponseEntity.ok(compMap.toResponseDto(updated));
    }

    @PostMapping("/{id}/stop")
    @PreAuthorize("hasRole('GYM')")
    public ResponseEntity<CompetitionResponseDto> stopCompetition(
        @PathVariable Long id,
        @CurrentGym Gym gym
    ) {
        Competition comp = competitionService.getById(id);
        if (comp == null || !comp.getGym().getId().equals(gym.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Competition updated = competitionService.stopCompetition(id);
        return ResponseEntity.ok(compMap.toResponseDto(updated));
    }

    @GetMapping("/{compId}/heats")
    public ResponseEntity<List<ResolvedHeatDto>> getHeats(
        @PathVariable Long compId,
        @CurrentGym Gym gym
    ) {
        Competition comp = competitionService.getById(compId);

        List<Heat> heats = heatService.getByCompetition(comp);

        return ResponseEntity.ok(heats.stream()
            .map(heatMap::toDto)
            .toList()
        );
    }

    @GetMapping("/{compId}/registrations")
    public ResponseEntity<List<RegistrationResponseDto>> getRegistrations(
        @PathVariable Long compId,
        @CurrentGym Gym gym
    ) {
        Competition comp = competitionService.getById(compId);

        List<Registration> regs = registrationService.getByCompetition(comp);

        return ResponseEntity.ok(regs.stream()
            .map(regMap::toResponseDto)
            .toList()
        );
    }

    @PutMapping(("/{compId}/routes"))
    public ResponseEntity<List<RouteResponseDto>> createOrUpdateRoutes(
        @PathVariable Long compId,
        @CurrentGym Gym gym,
        @RequestBody List<RouteUpsertDto> routes
    ) {
        List<Route> updated = routeService.upsertRoutes(
            gym,
            compId,
            routes
        );

        return ResponseEntity.ok(
            routeMap.toResponseDtoList(updated)
        );
    }

}

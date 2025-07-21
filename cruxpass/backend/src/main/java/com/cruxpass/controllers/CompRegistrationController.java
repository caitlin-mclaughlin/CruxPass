package com.cruxpass.controllers;

import com.cruxpass.dtos.requests.CompRegistrationRequestDto;
import com.cruxpass.dtos.responses.RegistrationResponseDto;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Registration;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.CompetitionService;
import com.cruxpass.services.RegistrationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/gyms/{gymId}/competitions/{competitionId}/registrations")
public class CompRegistrationController {

    private final CurrentUserService currentUserService;
    private final RegistrationService registrationService;
    private final CompetitionService competitionService;

    public CompRegistrationController(CurrentUserService currentUserService,
            RegistrationService registrationService, CompetitionService competitionService) {
        this.currentUserService = currentUserService;
        this.registrationService = registrationService;
        this. competitionService = competitionService;
    }

    @GetMapping
    public ResponseEntity<List<RegistrationResponseDto>> getAll(
        @PathVariable Long gymId,
        @PathVariable Long competitionId,
        @RequestHeader("Authorization") String authHeader
    ) {
        currentUserService.validateGymAccess(gymId, authHeader);
        Competition comp = competitionService.getById(competitionId);
        if (comp == null) return ResponseEntity.notFound().build();

        List<Registration> regs = registrationService.getByCompetition(comp);
        if (regs == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(regs.stream()
            .map(reg -> 
                new RegistrationResponseDto(
                    reg.getId(),
                    gymId,
                    competitionId,
                    reg.getCompetitorGroup(),
                    reg.getGender(),
                    reg.getClimber().getName(),
                    reg.getClimber().getEmail(),
                    reg.isPaid()
                )
            ).toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegistrationResponseDto> getById(
        @PathVariable Long id,
        @PathVariable Long gymId,
        @PathVariable Long competitionId,
        @RequestHeader("Authorization") String authHeader
    ) {
        currentUserService.validateGymAccess(gymId, authHeader);
        Registration reg = registrationService.getById(id);
        if (reg == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(new RegistrationResponseDto(
            reg.getId(),
            gymId,
            competitionId,
            reg.getCompetitorGroup(),
            reg.getGender(),
            reg.getClimber().getName(),
            reg.getClimber().getEmail(),
            reg.isPaid()
        ));
    }

    @PostMapping
    public ResponseEntity<?> registerForCompetition(
        @PathVariable Long gymId,
        @PathVariable Long competitionId,
        @RequestBody CompRegistrationRequestDto dto,
        @RequestHeader("Authorization") String authHeader
    ) {
        var climber = currentUserService.getClimberFromToken(authHeader);
        if (climber == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        var competition = competitionService.getById(competitionId);
        if (competition == null) return ResponseEntity.notFound().build();
        if (competition.getGym().getId() != gymId) return ResponseEntity.badRequest().build();

        if (registrationService.existsByClimberAndCompetition(climber, competition)) {
            return ResponseEntity.badRequest().body("Already registered");
        }

        Registration reg = new Registration();
        reg.setClimber(climber);
        reg.setCompetition(competition);
        reg.setCompetitorGroup(dto.competitorGroup());
        reg.setGender(dto.gender());
        reg.setPaid(dto.paid());

        registrationService.save(reg);
        return ResponseEntity.ok("Successfully registered");
    }

}
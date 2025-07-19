package com.cruxpass.controllers;

import com.cruxpass.dtos.AddressDto;
import com.cruxpass.dtos.CompetitionDto;
import com.cruxpass.dtos.responses.CompetitionResponseDto;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Registration;
import com.cruxpass.models.Climber;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.CompetitionService;
import com.cruxpass.services.GymService;
import com.cruxpass.services.RegistrationService;
import com.cruxpass.services.ClimberService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gyms/{gymId}/competitions")
public class CompetitionController {

    private final CompetitionService competitionService;
    private final RegistrationService registrationService;
    private final ClimberService climberService;
    private final GymService gymService;
    private final CurrentUserService currentUserService;

    public CompetitionController(CompetitionService competitionService, 
                                 RegistrationService registrationService,
                                 ClimberService climberService,
                                 GymService gymService,
                                 CurrentUserService currentUserService) {
        this.competitionService = competitionService;
        this.registrationService = registrationService;
        this.climberService = climberService;
        this.gymService = gymService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompetitionResponseDto> getCompetition(@PathVariable Long id) {
        var comp = competitionService.getById(id);
        if (comp == null) return null;

        return ResponseEntity.ok(new CompetitionResponseDto(comp));
    }

    @PostMapping
    @PreAuthorize("hasRole('GYM')")
    public ResponseEntity<?> createCompetition(
            @RequestBody CompetitionDto dto,
            @RequestHeader("Authorization") String authHeader) {

        try {
            Gym gym = currentUserService.getGymFromToken(authHeader);

            if (gym == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not an authorized gym");
            }

            System.out.println("Creating competition for gym: " + gym.getName());
            Competition newComp = competitionService.createCompetition(dto, gym);

            return ResponseEntity.ok(new CompetitionResponseDto(newComp));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

}

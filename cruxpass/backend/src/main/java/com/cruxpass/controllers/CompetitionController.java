package com.cruxpass.controllers;

import com.cruxpass.dtos.CompetitionDto;
import com.cruxpass.dtos.CompetitionResponseDto;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Registration;
import com.cruxpass.models.User;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.CompetitionService;
import com.cruxpass.services.GymService;
import com.cruxpass.services.RegistrationService;
import com.cruxpass.services.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/competitions")
public class CompetitionController {

    private final CompetitionService competitionService;
    private final RegistrationService registrationService;
    private final UserService userService;
    private final GymService gymService;
    private final CurrentUserService currentUserService;

    public CompetitionController(CompetitionService competitionService, 
                                 RegistrationService registrationService,
                                 UserService userService,
                                 GymService gymService,
                                 CurrentUserService currentUserService) {
        this.competitionService = competitionService;
        this.registrationService = registrationService;
        this.userService = userService;
        this.gymService = gymService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<CompetitionResponseDto> getAllCompetitions() {
        return competitionService.getAllCompetitions().stream()
            .map(comp -> new CompetitionResponseDto(comp))
            .toList();
    }

    @GetMapping("/{id}")
    public CompetitionResponseDto getCompetition(@PathVariable Long id) {
        var comp = competitionService.getById(id);
        if (comp == null) return null;

        return new CompetitionResponseDto(comp);
    }


    @PostMapping("/{id}/register")
    public ResponseEntity<?> registerForCompetition(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        User user = currentUserService.getUserFromToken(authHeader);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Competition competition = competitionService.getById(id);
        if (competition == null) return ResponseEntity.notFound().build();

        if (registrationService.existsByUserAndCompetition(user, competition)) {
            return ResponseEntity.badRequest().body("Already registered.");
        }

        Registration reg = new Registration();
        reg.setUser(user);
        reg.setCompetition(competition);
        reg.setPaid(true); // simplify for MVP

        registrationService.save(reg);
        return ResponseEntity.ok("Registration complete.");
    }

    @PostMapping
    @PreAuthorize("hasRole('GYM')")
    public ResponseEntity<?> createCompetition(
            @RequestBody CompetitionDto dto,
            @RequestHeader("Authorization") String authHeader) {

        try {
            System.out.println("Raw auth header: " + authHeader);
            String email = currentUserService.extractEmail(authHeader);
            System.out.println("Email from token: " + email);

            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Could not extract email");
            }

            Gym gym = gymService.getByEmail(email);
            if (gym == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Gym not found for email: " + email);
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
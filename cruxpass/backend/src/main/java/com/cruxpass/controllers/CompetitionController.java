package com.cruxpass.controllers;

import com.cruxpass.models.Competition;
import com.cruxpass.models.Registration;
import com.cruxpass.models.User;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.CompetitionService;
import com.cruxpass.services.RegistrationService;
import com.cruxpass.services.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/competitions")
public class CompetitionController {

    private final CompetitionService competitionService;
    private final RegistrationService registrationService;
    private final UserService userService;
    private final CurrentUserService currentUserService;

    public CompetitionController(CompetitionService competitionService, 
                                 RegistrationService registrationService,
                                 UserService userService,
                                 CurrentUserService currentUserService) {
        this.competitionService = competitionService;
        this.registrationService = registrationService;
        this.userService = userService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<Competition> getAllCompetitions() {
        return competitionService.getAllCompetitions();
    }

    @GetMapping("/{id}")
    public Competition getCompetition(@PathVariable Long id) {
        return competitionService.getById(id);
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

}
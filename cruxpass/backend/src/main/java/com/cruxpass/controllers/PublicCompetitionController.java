package com.cruxpass.controllers;

import com.cruxpass.dtos.AddressDto;
import com.cruxpass.dtos.SimpleRegistrationDto;
import com.cruxpass.dtos.responses.CompetitionResponseDto;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Registration;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.CompetitionService;
import com.cruxpass.services.RegistrationService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/competitions")
public class PublicCompetitionController {

    private final CurrentUserService currentUserService;
    private final CompetitionService competitionService;
    private final RegistrationService registrationService;

    public PublicCompetitionController(CurrentUserService currentUserService, 
            CompetitionService competitionService, RegistrationService registrationService) {
        this.currentUserService = currentUserService;
        this.competitionService = competitionService;
        this.registrationService = registrationService;
    }

    @GetMapping
    public ResponseEntity<List<CompetitionResponseDto>> getAllCompetitions(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        final Climber climber = (authHeader != null && !authHeader.isBlank())
            ? currentUserService.getClimberFromToken(authHeader)
            : null;

        List<Competition> competitions = competitionService.getAllCompetitions();

        return ResponseEntity.ok(competitions.stream()
            .map(comp -> {
                Registration reg = climber != null ?
                    registrationService.getByClimberAndCompetition(climber, comp) : null;
                SimpleRegistrationDto simpleReg = reg != null ?
                    new SimpleRegistrationDto(reg.getGender(), reg.getCompetitorGroup()) : null;

                return new CompetitionResponseDto(comp, reg != null, simpleReg);
            })
            .toList());
    }

}


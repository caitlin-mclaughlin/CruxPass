package com.cruxpass.controllers;

import com.cruxpass.annotations.CurrentClimber;
import com.cruxpass.dtos.requests.CompRegistrationRequestDto;
import com.cruxpass.dtos.responses.RegistrationResponseDto;
import com.cruxpass.mappers.RegistrationMapper;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Registration;
import com.cruxpass.services.CompetitionService;
import com.cruxpass.services.RegistrationService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/competitions/{compId}/registrations")
public class CompRegistrationController {

    private final RegistrationService registrationService;
    private final CompetitionService competitionService;

    @Autowired
    private RegistrationMapper regMap;

    @GetMapping("/me")
    public ResponseEntity<RegistrationResponseDto> getMyRegistration(
        @PathVariable Long compId,
        @CurrentClimber Climber climber
    ) {
        Registration reg = registrationService.getByClimberIdAndCompetitionId(climber.getId(), compId);
        if (reg == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(regMap.toResponseDto(reg));
    }

    /*@PutMapping("/me")
    public ResponseEntity<RegistrationResponseDto> registerForCompetition(
        @PathVariable Long compId,
        @RequestBody CompRegistrationRequestDto dto,
        @CurrentClimber Climber climber
    ) {
        Competition competition = competitionService.getById(compId);

        // Prevent duplicate registration
        if (registrationService.existsByClimberAndCompetition(climber, competition)) {
            return ResponseEntity.badRequest().build();
        }
        
        // Check registration deadline
        if (competition.getDeadline() == null || competition.isPastDeadline()) {
            return ResponseEntity.badRequest().build();
        }

        // Check capacity
        long currentCount = registrationService.countByCompetition(competition);
        if (competition.getCapacity() > 0 && currentCount >= competition.getCapacity()) {
            return ResponseEntity.badRequest().build();
        }

        Registration reg = regMap.toEntity(dto, climber, competition);
        registrationService.save(reg);

        return ResponseEntity.ok(regMap.toResponseDto(reg));
    }
    */
}

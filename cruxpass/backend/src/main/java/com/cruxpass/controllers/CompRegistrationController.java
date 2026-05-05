package com.cruxpass.controllers;

import com.cruxpass.annotations.CurrentClimber;
import com.cruxpass.dtos.requests.CompRegistrationRequestDto;
import com.cruxpass.dtos.responses.RegistrationResponseDto;
import com.cruxpass.dtos.responses.SimpleRegistrationResponseDto;
import com.cruxpass.mappers.RegistrationMapper;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Registration;
import com.cruxpass.services.CompetitionService;
import com.cruxpass.services.RegistrationService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping
    public ResponseEntity<List<SimpleRegistrationResponseDto>> getRegistrations(
        @PathVariable Long compId
    ) {
        Competition competition = competitionService.getById(compId);
        if (competition == null) return ResponseEntity.notFound().build();

        List<Registration> regs = registrationService.getByCompetition(competition);
        return ResponseEntity.ok(
            regs.stream().map(regMap::toSimpleResponseDto).toList()
        );
    }

    @PutMapping("/me")
    public ResponseEntity<RegistrationResponseDto> registerForCompetition(
        @PathVariable Long compId,
        @RequestBody CompRegistrationRequestDto dto,
        @CurrentClimber Climber climber
    ) {
        Competition competition = competitionService.getByIdWithHeats(compId);
        if (competition == null) return ResponseEntity.notFound().build();

        // Prevent duplicate registration
        if (registrationService.existsByClimberAndCompetition(climber, competition)) {
            return ResponseEntity.badRequest().build();
        }
        
        // Check registration deadline
        if (competition.getDeadline() == null || competition.isPastDeadline()) {
            return ResponseEntity.badRequest().build();
        }

        Registration reg;
        try {
            reg = regMap.toEntity(dto, climber, competition);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
        registrationService.save(reg);

        return ResponseEntity.ok(regMap.toResponseDto(reg));
    }

}

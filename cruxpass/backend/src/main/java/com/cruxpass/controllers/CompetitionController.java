package com.cruxpass.controllers;

import com.cruxpass.dtos.requests.UpdateCompRequestDto;
import com.cruxpass.dtos.responses.CompetitionResponseDto;
import com.cruxpass.mappers.CompetitionMapper;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.CompetitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gyms/{gymId}/competitions")
public class CompetitionController {

    private final CompetitionService competitionService;
    private final CurrentUserService currentUserService;

    @Autowired
    private CompetitionMapper compMap;

    public CompetitionController(CompetitionService competitionService, 
                                 CurrentUserService currentUserService) {
        this.competitionService = competitionService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompetitionResponseDto> getCompetition(@PathVariable Long id) {
        Competition comp = competitionService.getById(id).orElse(null);
        if (comp == null) return null;

        return ResponseEntity.ok(compMap.toResponseDto(comp));
    }

    @PutMapping
    @PreAuthorize("hasRole('GYM')")
    public ResponseEntity<?> createCompetition(
            @RequestBody UpdateCompRequestDto dto,
            @RequestHeader("Authorization") String authHeader) {

        try {
            Gym gym = currentUserService.getGymFromToken(authHeader);
            if (gym == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();


            Competition newComp = compMap.toEntity(dto, gym);
            Competition savedComp = competitionService.save(newComp);

            return ResponseEntity.ok(compMap.toResponseDto(savedComp));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCompetition(
        @RequestHeader("Authorization") String authHeader,
        @PathVariable Long id,
        @RequestBody UpdateCompRequestDto updateRequest
    ) {
        try {
            Gym gym = currentUserService.getGymFromToken(authHeader);
            if (gym == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

            Competition comp = competitionService.getById(id).orElse(null);
            if (comp == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            compMap.updateCompetitionFromDto(updateRequest, comp);
            Competition updated = competitionService.save(comp);

            return ResponseEntity.ok(compMap.toResponseDto(updated));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
}

package com.cruxpass.controllers;

import com.cruxpass.dtos.requests.UpdateClimberRequestDto;
import com.cruxpass.dtos.responses.ClimberResponseDto;
import com.cruxpass.mappers.ClimberMapper;
import com.cruxpass.models.Climber;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.ClimberService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/climbers")
public class ClimberController {

    private final ClimberService climberService;
    private final CurrentUserService currentUserService;
    
    @Autowired
    private ClimberMapper climberMap;

    public ClimberController(ClimberService climberService, CurrentUserService currentUserService) {
        this.climberService = climberService;
        this.currentUserService = currentUserService;
    }

    // Optional: For admin or testing purposes
    @GetMapping
    public ResponseEntity<List<ClimberResponseDto>> getAll() {
        List<Climber> climbers = climberService.getAll();
        if (climbers == null || climbers.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(climbers.stream()
            .map(climber -> climberMap.toDto(climber))
            .toList());
    }

    // Secure endpoint for logged-in climber
    @GetMapping("/me")
    public ResponseEntity<ClimberResponseDto> getCurrentClimber(
        @RequestHeader("Authorization") String authHeader
    ) {
        Climber climber = currentUserService.getClimberFromToken(authHeader);
        if (climber == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(climberMap.toDto(climber));
    }

    @PutMapping("/me")
    public ResponseEntity<ClimberResponseDto> updateClimber(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody UpdateClimberRequestDto updateRequest
    ) {
        Climber climber = currentUserService.getClimberFromToken(authHeader);
        if (climber == null) {
            return ResponseEntity.status(403).build(); // Or 401
        }

        climberMap.updateEntityFromDto(updateRequest, climber);

        return ResponseEntity.ok(climberMap.toDto(climberService.save(climber)));
    }
}

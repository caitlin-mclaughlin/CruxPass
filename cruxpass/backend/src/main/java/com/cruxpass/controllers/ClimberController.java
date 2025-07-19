package com.cruxpass.controllers;

import com.cruxpass.dtos.AddressDto;
import com.cruxpass.dtos.requests.UpdateClimberRequestDto;
import com.cruxpass.dtos.responses.ClimberResponseDto;
import com.cruxpass.models.Climber;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.ClimberService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/climbers")
public class ClimberController {

    private final ClimberService climberService;
    private final CurrentUserService currentUserService;

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

        List<ClimberResponseDto> result = climbers.stream()
            .map(climber -> new ClimberResponseDto(
                climber.getId(),
                climber.getName(),
                climber.getEmail(),
                climber.getPhone(),
                climber.getUsername(),
                climber.getDob(),
                climber.getGender(),
                new AddressDto(climber.getAddress()),
                climber.getCreatedAt()
            )).toList();

        return ResponseEntity.ok(result);
    }

    // Secure endpoint for logged-in climber
    @GetMapping("/me")
    public ResponseEntity<ClimberResponseDto> getCurrentClimber(@RequestHeader("Authorization") String authHeader) {
        Climber climber = currentUserService.getClimberFromToken(authHeader);
        if (climber == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(new ClimberResponseDto(
            climber.getId(),
            climber.getName(),
            climber.getEmail(),
            climber.getPhone(),
            climber.getUsername(),
            climber.getDob(),
            climber.getGender(),
            new AddressDto(climber.getAddress()),
            climber.getCreatedAt()
        ));
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

        climber.setName(updateRequest.name());
        climber.setEmail(updateRequest.email());
        climber.setPhone(updateRequest.phone());
        climber.setUsername(updateRequest.username());
        climber.setDob(updateRequest.dob());
        climber.setGender(updateRequest.gender());
        climber.setAddress(updateRequest.address().toEntity());

        Climber updated = climberService.save(climber); // Or .updateClimber(climber)

        return ResponseEntity.ok(new ClimberResponseDto(
            updated.getId(),
            updated.getName(),
            updated.getEmail(),
            updated.getPhone(),
            updated.getUsername(),
            updated.getDob(),
            updated.getGender(),
            new AddressDto(updated.getAddress()),
            updated.getCreatedAt()
        ));
    }
}

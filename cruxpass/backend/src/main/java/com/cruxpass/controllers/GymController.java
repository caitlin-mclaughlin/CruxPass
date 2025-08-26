package com.cruxpass.controllers;

import com.cruxpass.dtos.requests.UpdateGymRequestDto;
import com.cruxpass.dtos.responses.GymResponseDto;
import com.cruxpass.mappers.GymMapper;
import com.cruxpass.models.Gym;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.GymService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gyms")
public class GymController {

    private final GymService gymService;
    private final CurrentUserService currentUserService;

    @Autowired
    private GymMapper gymMap;

    public GymController(GymService gymService, CurrentUserService currentUserService) {
        this.gymService = gymService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public ResponseEntity<List<GymResponseDto>> getAll() {
        List<Gym> gyms = gymService.getAll();
        if (gyms == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(gyms.stream()
            .map(gym -> gymMap.toResponseDto(gym))
            .toList());
    }

    // Secure endpoint for logged-in gym
    @GetMapping("/me")
    public ResponseEntity<GymResponseDto> getCurrentGym(@RequestHeader("Authorization") String authHeader) {
        Gym gym = currentUserService.getGymFromToken(authHeader);
        if (gym == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(gymMap.toResponseDto(gym));
    }

    @PutMapping("/me")
    public ResponseEntity<GymResponseDto> updateGym(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody UpdateGymRequestDto updateRequest
    ) {
        Gym gym = currentUserService.getGymFromToken(authHeader);
        if (gym == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // Or 401
        }

        gymMap.updateGymFromDto(updateRequest, gym);

        return ResponseEntity.ok(gymMap.toResponseDto(gymService.save(gym)));
    }
}
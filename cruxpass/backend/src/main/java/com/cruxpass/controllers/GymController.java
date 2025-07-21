package com.cruxpass.controllers;

import com.cruxpass.dtos.AddressDto;
import com.cruxpass.dtos.requests.UpdateGymRequestDto;
import com.cruxpass.dtos.responses.GymResponseDto;
import com.cruxpass.models.Gym;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.GymService;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gyms")
public class GymController {

    private final GymService gymService;
    private final CurrentUserService currentUserService;

    public GymController(GymService gymService, CurrentUserService currentUserService) {
        this.gymService = gymService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public ResponseEntity<List<GymResponseDto>> getAll() {
        List<Gym> gyms = gymService.getAll();
        if (gyms == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(gyms.stream()
            .map(gym -> new GymResponseDto(
                gym.getId(),
                gym.getName(), 
                gym.getEmail(),
                gym.getPhone(),
                gym.getUsername(),
                new AddressDto(gym.getAddress()),
                gym.getCreatedAt()
            ))
            .toList());
    }

    // Secure endpoint for logged-in gym
    @GetMapping("/me")
    public ResponseEntity<GymResponseDto> getCurrentGym(@RequestHeader("Authorization") String authHeader) {
        Gym gym = currentUserService.getGymFromToken(authHeader);
        if (gym == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(new GymResponseDto(
            gym.getId(),
            gym.getName(), 
            gym.getEmail(),
            gym.getPhone(),
            gym.getUsername(),
            new AddressDto(gym.getAddress()),
            gym.getCreatedAt()
        ));
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

        gym.setName(updateRequest.name());
        gym.setEmail(updateRequest.email());
        gym.setPhone(updateRequest.phone());
        gym.setUsername(updateRequest.username());
        gym.setAddress(updateRequest.address().toEntity());

        Gym updated = gymService.save(gym);

        return ResponseEntity.ok(new GymResponseDto(
            gym.getId(),
            updated.getName(),
            updated.getEmail(),
            updated.getPhone(),
            updated.getUsername(),
            new AddressDto(updated.getAddress()),
            updated.getCreatedAt()
        ));
    }
}
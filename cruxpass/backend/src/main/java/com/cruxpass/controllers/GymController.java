package com.cruxpass.controllers;

import com.cruxpass.dtos.GymProfileDto;
import com.cruxpass.models.Gym;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.GymService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gyms")
public class GymController {

    private final GymService gymService;
    private final CurrentUserService currentUser;

    public GymController(GymService gymService, CurrentUserService currentUser) {
        this.gymService = gymService;
        this.currentUser = currentUser;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('GYM')")
    public ResponseEntity<GymProfileDto> getMyGym(Authentication authentication) {
        String email = authentication.getName();  // Spring sets this to the username/email from token

        System.out.println("Looking for gym with email: " + email);
        Gym gym = gymService.getByEmail(email);

        if (gym == null) {
            return ResponseEntity.status(404).build();
        }

        var dto = new GymProfileDto(
            gym.getName(),
            gym.getEmail(),
            gym.getPhone(),
            gym.getAddress()
        );

        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public List<Gym> getAll() {
        return gymService.getAll();
    }

    @GetMapping("/{id}")
    public Gym getById(@PathVariable Long id) {
        return gymService.getById(id);
    }
}
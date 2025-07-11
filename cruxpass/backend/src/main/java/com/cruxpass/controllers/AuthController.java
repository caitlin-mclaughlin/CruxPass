package com.cruxpass.controllers;

import com.cruxpass.dtos.AuthRequest;
import com.cruxpass.dtos.AuthResponse;
import com.cruxpass.dtos.GymProfileDto;
import com.cruxpass.dtos.RegisterRequest;
import com.cruxpass.dtos.UserProfileDto;
import com.cruxpass.models.Gym;
import com.cruxpass.models.User;
import com.cruxpass.security.JwtUtil;
import com.cruxpass.services.GymService;
import com.cruxpass.services.UserService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final GymService gymService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;

    public AuthController(UserService userService, GymService gymService, JwtUtil jwtUtil, AuthenticationManager authManager) {
        this.userService = userService;
        this.gymService = gymService;
        this.jwtUtil = jwtUtil;
        this.authManager = authManager;
    }

    @PostMapping("/register/{type}")
    public ResponseEntity<AuthResponse> register(
            @PathVariable String type,
            @Valid @RequestBody RegisterRequest dto
    ) {
        String email = dto.email;
        switch (type.toLowerCase()) {
            case "user" -> userService.createUser(dto);
            case "gym" -> gymService.createGym(dto);
            default -> {
                return ResponseEntity.badRequest().build();
            }
        }

        String token = jwtUtil.generateToken(email);
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest dto) {
        String id = dto.emailOrUsername;

        // Try to find user by email or username
        var user = userService.getByEmailOrUsername(id);
        if (user != null) {
            if (!userService.passwordMatches(user, dto.password)) {
                throw new IllegalArgumentException("Invalid password");
            }
            String token = jwtUtil.generateToken(user.getEmail());
            return ResponseEntity.ok(new AuthResponse(token));
        }

        // Try to find gym
        var gym = gymService.getByEmailOrUsername(id);
        if (gym != null) {
            if (!gymService.passwordMatches(gym, dto.password)) {
                throw new IllegalArgumentException("Invalid password");
            }
            String token = jwtUtil.generateToken(gym.getEmail());
            return ResponseEntity.ok(new AuthResponse(token));
        }

        throw new IllegalArgumentException("Account not found");
    }


    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        User user = userService.getByEmail(email);
        if (user != null) {
            return ResponseEntity.ok(Map.of(
                "type", "user",
                "user", new UserProfileDto(user.getName(), user.getEmail(), user.getPhone(), user.getAddress())
            ));
        }

        Gym gym = gymService.getByEmail(email);
        if (gym != null) {
            return ResponseEntity.ok(Map.of(
                "type", "gym",
                "gym", new GymProfileDto(gym.getName(), gym.getEmail(), gym.getPhone(), gym.getAddress())
            ));
        }

        return ResponseEntity.status(404).body("Account not found");
    }
}

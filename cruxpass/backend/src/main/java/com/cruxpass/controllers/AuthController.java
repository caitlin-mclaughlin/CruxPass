package com.cruxpass.controllers;

import com.cruxpass.dtos.AddressDto;
import com.cruxpass.dtos.requests.AuthRequest;
import com.cruxpass.dtos.requests.RegisterRequest;
import com.cruxpass.dtos.responses.AuthResponse;
import com.cruxpass.dtos.responses.ClimberResponseDto;
import com.cruxpass.dtos.responses.GymResponseDto;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Climber;
import com.cruxpass.security.JwtUtil;
import com.cruxpass.services.GymService;
import com.cruxpass.services.ClimberService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final ClimberService climberService;
    private final GymService gymService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;

    public AuthController(ClimberService climberService, GymService gymService, JwtUtil jwtUtil, AuthenticationManager authManager) {
        this.climberService = climberService;
        this.gymService = gymService;
        this.jwtUtil = jwtUtil;
        this.authManager = authManager;
    }

    @PostMapping("/register/{type}")
    public ResponseEntity<AuthResponse> register(
            @PathVariable String type,
            @Valid @RequestBody RegisterRequest dto
    ) {
        Long id;
        switch (type.toLowerCase()) {
            case "climber" -> {
                Climber climber = climberService.createUser(dto);
                id = climber.getId();
                break;
            }
            case "gym" -> {
                Gym gym = gymService.createGym(dto);
                id = gym.getId();
                break;
            }
            default -> {
                return ResponseEntity.badRequest().build();
            }
        }

        String email = switch (type.toLowerCase()) {
            case "climber" -> climberService.getByUsername(dto.username).getEmail();
            case "gym" -> gymService.getByUsername(dto.username).getEmail();
            default -> null;
        };

        System.out.println("Generating token with email: " + email + " and role: " + type.toUpperCase());

        String token = jwtUtil.generateToken(email, type.toUpperCase(), id);
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest dto) {
        String id = dto.emailOrUsername;

        // Try to find climber by email or username
        var climber = climberService.getByEmailOrUsername(id);
        if (climber != null) {
            if (!climberService.passwordMatches(climber, dto.password)) {
                throw new IllegalArgumentException("Invalid password");
            }
            String token = jwtUtil.generateToken(climber.getEmail(), "CLIMBER", climber.getId());
            return ResponseEntity.ok(new AuthResponse(token));
        }

        // Try to find gym
        var gym = gymService.getByEmailOrUsername(id);
        if (gym != null) {
            if (!gymService.passwordMatches(gym, dto.password)) {
                throw new IllegalArgumentException("Invalid password");
            }
            String token = jwtUtil.generateToken(gym.getEmail(), "GYM", gym.getId());
            return ResponseEntity.ok(new AuthResponse(token));
        }

        throw new IllegalArgumentException("Account not found");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String role = jwtUtil.extractRole(token);
        Long id = jwtUtil.extractId(token);

        if ("CLIMBER".equalsIgnoreCase(role)) {
            Climber climber = climberService.getById(id);
            if (climber != null) {
                return ResponseEntity.ok(Map.of(
                    "type", "climber",
                    "climber", new ClimberResponseDto(
                        climber.getId(),
                        climber.getName(),
                        climber.getEmail(),
                        climber.getPhone(),
                        climber.getUsername(),
                        climber.getDob(),
                        climber.getGender(),
                        new AddressDto(climber.getAddress()),
                        climber.getCreatedAt()
                    )
                ));
            }
        } else if ("GYM".equalsIgnoreCase(role)) {
            Gym gym = gymService.getById(id);
            if (gym != null) {
                return ResponseEntity.ok(Map.of(
                    "type", "gym",
                    "gym", new GymResponseDto(
                        gym.getId(),
                        gym.getName(),
                        gym.getEmail(),
                        gym.getPhone(),
                        gym.getUsername(),
                        new AddressDto(gym.getAddress()),
                        gym.getCreatedAt()
                    )
                ));
            }
        }

        return ResponseEntity.notFound().build();
    }
}

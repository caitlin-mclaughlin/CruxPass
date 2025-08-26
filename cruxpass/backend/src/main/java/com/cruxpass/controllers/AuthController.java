package com.cruxpass.controllers;

import com.cruxpass.dtos.AddressDto;
import com.cruxpass.dtos.requests.AuthRequest;
import com.cruxpass.dtos.requests.RegisterRequest;
import com.cruxpass.dtos.responses.AuthResponse;
import com.cruxpass.dtos.responses.ClimberResponseDto;
import com.cruxpass.dtos.responses.GymResponseDto;
import com.cruxpass.enums.AccountType;
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

    @PutMapping("/register/{type}")
    public ResponseEntity<AuthResponse> register(
            @PathVariable AccountType type,
            @Valid @RequestBody RegisterRequest dto
    ) {
        Long id;
        switch (type) {
            case CLIMBER -> {
                Climber climber = climberService.createUser(dto);
                id = climber.getId();
                break;
            }
            case GYM-> {
                Gym gym = gymService.createGym(dto);
                id = gym.getId();
                break;
            }
            default -> {
                return ResponseEntity.badRequest().build();
            }
        }

        String email = switch (type) {
            case CLIMBER -> climberService.getByUsername(dto.username).getEmail();
            case GYM -> gymService.getByUsername(dto.username).getEmail();
            default -> null;
        };

        System.out.println("Generating token with email: " + email + " and role: " + type);

        String token = jwtUtil.generateToken(email, type, id);
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PutMapping("/")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest dto) {
        String id = dto.emailOrUsername;

        // Try to find climber by email or username
        var climber = climberService.getByEmailOrUsername(id);
        if (climber != null) {
            if (!climberService.passwordMatches(climber, dto.password)) {
                throw new IllegalArgumentException("Invalid password");
            }
            String token = jwtUtil.generateToken(climber.getEmail(), AccountType.CLIMBER, climber.getId());
            return ResponseEntity.ok(new AuthResponse(token));
        }

        // Try to find gym
        var gym = gymService.getByEmailOrUsername(id);
        if (gym != null) {
            if (!gymService.passwordMatches(gym, dto.password)) {
                throw new IllegalArgumentException("Invalid password");
            }
            String token = jwtUtil.generateToken(gym.getEmail(), AccountType.GYM, gym.getId());
            return ResponseEntity.ok(new AuthResponse(token));
        }

        throw new IllegalArgumentException("Account not found");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        AccountType role = jwtUtil.extractRole(token);
        Long id = jwtUtil.extractId(token);

        if (role == AccountType.CLIMBER) {
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
                        climber.getDivision(),
                        new AddressDto(climber.getAddress()),
                        climber.getCreatedAt()
                    )
                ));
            }
        } else if (role == AccountType.GYM) {
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

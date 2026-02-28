package com.cruxpass.controllers;

import com.cruxpass.dtos.AddressDto;
import com.cruxpass.dtos.requests.AuthRequest;
import com.cruxpass.dtos.requests.RegisterRequest;
import com.cruxpass.dtos.responses.AuthResponse;
import com.cruxpass.dtos.responses.ClimberResponseDto;
import com.cruxpass.dtos.responses.GymResponseDto;
import com.cruxpass.enums.AccountType;
import com.cruxpass.mappers.SeriesMapper;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Series;
import com.cruxpass.models.Climber;
import com.cruxpass.security.JwtUtil;
import com.cruxpass.services.GymService;
import com.cruxpass.services.SeriesService;
import com.cruxpass.services.ClimberService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final ClimberService climberService;
    private final GymService gymService;
    private final SeriesService seriesService;
    private final JwtUtil jwtUtil;

    @Autowired
    private final SeriesMapper seriesMap;

    @PostMapping("/register/{type}")
    public ResponseEntity<AuthResponse> register(
            @PathVariable AccountType type,
            @Valid @RequestBody RegisterRequest dto
    ) {
        Long id;
        switch (type) {
            case CLIMBER -> {
                Climber climber = climberService.createAdult(dto);
                id = climber.getId();
                break;
            }
            case GYM-> {
                Gym gym = gymService.createGym(dto);
                id = gym.getId();
                break;
            }
            case SERIES-> {
                Series series = seriesService.createSimpleSeries(dto);
                id = series.getId();
                break;
            }
            default -> {
                return ResponseEntity.badRequest().build();
            }
        }

        String email = switch (type) {
            case CLIMBER -> climberService.getByUsername(dto.username).getEmail();
            case GYM -> gymService.getByUsername(dto.username).getEmail();
            case SERIES -> seriesService.getByUsername(dto.username).getEmail();
            default -> null;
        };

        String token = jwtUtil.generateToken(email, type, id);
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest dto) {
        String id = dto.emailOrUsername();

        // Try to find climber by email or username
        Climber climber = climberService.getByEmailOrUsername(id);
        if (climber != null) {
            if (!climberService.passwordMatches(climber, dto.password())) {
                throw new IllegalArgumentException("Invalid password");
            }
            String token = jwtUtil.generateToken(climber.getEmail(), AccountType.CLIMBER, climber.getId());
            return ResponseEntity.ok(new AuthResponse(token));
        }

        // Try to find gym
        Gym gym = gymService.getByEmailOrUsername(id);
        if (gym != null) {
            if (!gymService.passwordMatches(gym, dto.password())) {
                throw new IllegalArgumentException("Invalid password");
            }
            String token = jwtUtil.generateToken(gym.getEmail(), AccountType.GYM, gym.getId());
            return ResponseEntity.ok(new AuthResponse(token));
        }

        // Try to find series
        Series series = seriesService.getByUsername(id);
        if (series != null) {
            if (!seriesService.passwordMatches(series, dto.password())) {
                throw new IllegalArgumentException("Invalid password");
            }
            String token = jwtUtil.generateToken(series.getEmail(), AccountType.SERIES, series.getId());
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
                        climber.getGender(),
                        new AddressDto(climber.getAddress()),
                        climber.getCreatedAt(),
                        climber.getEmergencyName(),
                        climber.getEmergencyPhone()
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
        } else if (role == AccountType.SERIES) {
            Series series = seriesService.getById(id);
            if (series != null) {
                return ResponseEntity.ok(Map.of(
                    "type", "series",
                    "series", seriesMap.toDto(series)
                ));
            }
        }

        return ResponseEntity.notFound().build();
    }
}

package com.cruxpass.security;

import com.cruxpass.models.Climber;
import com.cruxpass.models.Gym;
import com.cruxpass.repositories.ClimberRepository;
import com.cruxpass.repositories.GymRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CurrentUserService {

    private final JwtUtil jwtUtil;
    private final ClimberRepository climberRepo;
    private final GymRepository gymRepo;

    public CurrentUserService(JwtUtil jwtUtil, ClimberRepository climberRepo, GymRepository gymRepo) {
        this.jwtUtil = jwtUtil;
        this.climberRepo = climberRepo;
        this.gymRepo = gymRepo;
    }

    public Climber getClimberFromToken(String authHeader) {
        return climberRepo.findByEmail(extractEmail(authHeader)).orElse(null);
    }

    public Gym getGymFromToken(String authHeader) {
        return gymRepo.findByEmail(extractEmail(authHeader)).orElse(null);
    }

    public String extractEmail(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("Auth header missing or invalid: " + authHeader);
            return null;
        }

        String token = authHeader.substring(7); // remove "Bearer "
        if (!jwtUtil.validateToken(token)) {
            System.out.println("Invalid token: " + token);
            return null;
        }

        String email = jwtUtil.extractEmail(token);
        System.out.println("Extracted email from auth header: " + email);
        return email;
    }

    public Long getUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) return null;
        return jwtUtil.extractId(token);
    }

    public void validateGymAccess(Long gymId, String authHeader) {
        Gym gym = getGymFromToken(authHeader);
        if (gym == null || !gym.getId().equals(gymId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized gym");
        }
    }

    public void validateClimberAccess(Long climberId, String authHeader) {
        Climber climber = getClimberFromToken(authHeader);
        if (climber == null || !climber.getId().equals(climberId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized climber");
        }
    }

}


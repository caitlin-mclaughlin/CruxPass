package com.cruxpass.security;

import com.cruxpass.models.Climber;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Series;
import com.cruxpass.repositories.ClimberRepository;
import com.cruxpass.repositories.GymRepository;
import com.cruxpass.repositories.SeriesRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CurrentUserService {

    private final JwtUtil jwtUtil;
    private final ClimberRepository climberRepo;
    private final GymRepository gymRepo;
    private final SeriesRepository seriesRepo;

    public CurrentUserService(
        JwtUtil jwtUtil,
        ClimberRepository climberRepo,
        GymRepository gymRepo,
        SeriesRepository seriesRepo
    ) {
        this.jwtUtil = jwtUtil;
        this.climberRepo = climberRepo;
        this.gymRepo = gymRepo;
        this.seriesRepo = seriesRepo;
    }

    public Climber getClimberFromToken(String authHeader) {
        return climberRepo.findByEmailIgnoreCaseAndActiveTrue(extractEmail(authHeader)).orElse(null);
    }

    public Gym getGymFromToken(String authHeader) {
        return gymRepo.findByEmailIgnoreCaseAndActiveTrueWithSeries(extractEmail(authHeader)).orElse(null);
    }

    public Series getSeriesFromToken(String authHeader) {
        return seriesRepo.findByEmailIgnoreCaseAndActiveTrueWithGymsAndCompetitions(extractEmail(authHeader)).orElse(null);
    }

    public String extractEmail(String authHeader) {
        String token = jwtUtil.extractToken(authHeader); // remove "Bearer "

        if (!jwtUtil.validateToken(token)) {
            System.out.println("Invalid token: " + token);
            return null;
        }

        String email = jwtUtil.extractEmail(token);
        System.out.println("Extracted email from JWT: " + email);
        return email;
    }

    public Long getUserIdFromToken(String authHeader) {
        String token = jwtUtil.extractToken(authHeader);
        if (!jwtUtil.validateToken(token)) return null;
        return jwtUtil.extractId(token);
    }

    public void validateClimberAccess(Long climberId, String authHeader) {
        Climber climber = getClimberFromToken(authHeader);
        if (climber == null || !climber.getId().equals(climberId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized climber");
        }
    }

    public void validateGymAccess(Long gymId, String authHeader) {
        Gym gym = getGymFromToken(authHeader);
        if (gym == null || !gym.getId().equals(gymId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized gym");
        }
    }

    public void validateSeriesAccess(Long seriesId, String authHeader) {
        Series series = getSeriesFromToken(authHeader);
        if (series == null || !series.getId().equals(seriesId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized series");
        }
    }
}


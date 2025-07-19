package com.cruxpass.services;

import com.cruxpass.dtos.RankedSubmissionDto;
import com.cruxpass.dtos.RegionalScoreDto;
import com.cruxpass.dtos.requests.SubmissionRequestDto;
import com.cruxpass.dtos.ClimberScoreDto;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Route;
import com.cruxpass.models.Submission;
import com.cruxpass.models.SubmittedRoute;
import com.cruxpass.models.Climber;
import com.cruxpass.repositories.CompetitionRepository;
import com.cruxpass.repositories.RouteRepository;
import com.cruxpass.repositories.SubmissionRepository;
import com.cruxpass.repositories.ClimberRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SubmissionService {
    
    private final SubmissionRepository submissionRepo;
    private final RouteRepository routeRepo;
    private final CompetitionRepository compRepo;
    private final ClimberRepository climberRepo;

    public SubmissionService(
        SubmissionRepository submissionRepo,
        RouteRepository routeRepo,
        CompetitionRepository compRepo,
        ClimberRepository climberRepo
    ) {
        this.submissionRepo = submissionRepo;
        this.routeRepo = routeRepo;
        this.compRepo = compRepo;
        this.climberRepo = climberRepo;
    }

    public List<Submission> getAll() {
        return submissionRepo.findAll();
    }

    public Submission getById(Long id) {
        return submissionRepo.findById(id).orElse(null);
    }

    public void submitScore(Long compId, String userEmail, SubmissionRequestDto dto) {
        Climber climber = climberRepo.findByEmail(userEmail).orElseThrow();
        Competition comp = compRepo.findById(compId).orElseThrow();

        if (dto.routes.size() != 5) throw new IllegalArgumentException("Exactly 5 routes required");

        List<SubmittedRoute> submittedRoutes = new ArrayList<>();
        for (var r : dto.routes) {
            Route route = routeRepo.findById(r.routeId).orElseThrow();
            if (!route.getCompetition().getId().equals(compId)) {
                throw new IllegalArgumentException("Route not in this competition");
            }

            SubmittedRoute sr = new SubmittedRoute();
            sr.setRoute(route);
            sr.setAttempts(r.attempts);
            submittedRoutes.add(sr);
        }

        Submission submission = new Submission();
        submission.setClimber(climber);
        submission.setCompetition(comp);
        submission.setRoutes(submittedRoutes);

        submissionRepo.save(submission);
    }

    public int[] getTiebreakKey(Submission submission) {
        return submission.getRoutes().stream()
            .sorted((a, b) -> Integer.compare(b.getRoute().getPointValue(), a.getRoute().getPointValue()))
            .mapToInt(SubmittedRoute::getAttempts)
            .toArray();
    }

    public int getTotalScore(Submission s) {
        return s.getRoutes().stream()
                .mapToInt(r -> r.getRoute().getPointValue())
                .sum();
    }

    public List<Submission> getRankedSubmissions(Long competitionId) {
        List<Submission> all = submissionRepo.findByCompetitionId(competitionId);

        all.sort((a, b) -> {
            int scoreA = getTotalScore(a);
            int scoreB = getTotalScore(b);
            if (scoreA != scoreB) return Integer.compare(scoreB, scoreA); // higher score wins

            // Tie breaker: compare attempts
            int[] tieA = getTiebreakKey(a);
            int[] tieB = getTiebreakKey(b);
            for (int i = 0; i < 5; i++) {
                if (tieA[i] != tieB[i]) {
                    return Integer.compare(tieA[i], tieB[i]); // fewer attempts wins
                }
            }
            return 0;
        });

        return all;
    }

    public List<RankedSubmissionDto> getRankings(Long compId) {
        List<Submission> ranked = getRankedSubmissions(compId);
        List<RankedSubmissionDto> results = new ArrayList<>();

        int place = 1;
        for (Submission s : ranked) {
            List<SubmittedRoute> sorted = s.getRoutes().stream()
                .sorted((a, b) -> Integer.compare(b.getRoute().getPointValue(), a.getRoute().getPointValue()))
                .toList();

            List<Integer> points = sorted.stream()
                .map(r -> r.getRoute().getPointValue()).toList();
            List<Integer> attempts = sorted.stream()
                .map(SubmittedRoute::getAttempts).toList();

            results.add(new RankedSubmissionDto(place++, s.getClimber().getName(), getTotalScore(s), points, attempts));
        }
        return results;
    }

    public List<ClimberScoreDto> getScoresForUser(String email) {
        Climber climber = climberRepo.findByEmail(email).orElseThrow();
        List<Submission> submissions = submissionRepo.findByClimberId(climber.getId());

        return submissions.stream()
                .map(s -> new ClimberScoreDto(
                        s.getCompetition().getName(),
                        s.getCompetition().getDate(),
                        getTotalScore(s)
                )).toList();
    }
    
    public List<RegionalScoreDto> getSeriesalLeaderboard() {
        Map<Climber, Integer> pointsMap = new HashMap<>();

        List<Competition> competitions = compRepo.findAll();
        for (Competition comp : competitions) {
            List<Submission> ranked = getRankedSubmissions(comp.getId());

            for (int i = 0; i < ranked.size(); i++) {
                Climber u = ranked.get(i).getClimber();
                int placement = i + 1;
                int score = switch (placement) {
                    case 1 -> 100;
                    case 2 -> 90;
                    case 3 -> 80;
                    default -> 70 - (placement - 4) * 5; // 65, 60, 55, ...
                };
                score = Math.max(score, 0);
                pointsMap.put(u, pointsMap.getOrDefault(u, 0) + score);
            }
        }

        return pointsMap.entrySet().stream()
                .map(e -> new RegionalScoreDto(e.getKey().getName(), e.getKey().getSeries(), e.getValue()))
                .sorted((a, b) -> Integer.compare(b.totalPoints, a.totalPoints))
                .toList();
    }

}

package com.cruxpass.services;

import com.cruxpass.dtos.RankedSubmissionDto;
import com.cruxpass.dtos.RegionalScoreDto;
import com.cruxpass.dtos.SubmittedRouteDto;
import com.cruxpass.dtos.requests.SubmissionRequestDto;
import com.cruxpass.dtos.responses.SubmissionResponseDto;
import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Gender;
import com.cruxpass.dtos.ClimberScoreDto;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Registration;
import com.cruxpass.models.Route;
import com.cruxpass.models.Submission;
import com.cruxpass.models.SubmittedRoute;
import com.cruxpass.models.Climber;
import com.cruxpass.repositories.SubmissionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SubmissionService {
    
    private final SubmissionRepository submissionRepository;
    private final RouteService routeService;
    private final CompetitionService compService;
    private final ClimberService climberService;

    public SubmissionService(
        SubmissionRepository submissionRepository,
        RouteService routeService,
        CompetitionService compService,
        ClimberService climberService
    ) {
        this.submissionRepository = submissionRepository;
        this.routeService = routeService;
        this.compService = compService;
        this.climberService = climberService;
    }

    public List<Submission> getAll() {
        return submissionRepository.findAll();
    }

    public Submission getById(Long id) {
        return submissionRepository.findById(id).orElse(null);
    }

    public Submission getByCompetitionAndClimber(Long compId, Long climberId) {
        Submission subs = submissionRepository.findByCompetitionIdAndClimberIdWithRoutes(compId, climberId).orElse(null);
        return subs;
    }

    @Transactional
    public SubmissionResponseDto submitOrUpdateScores(Competition comp, Climber climber, SubmissionRequestDto dto) {
        if (climber == null || comp == null) return null;

        Submission submission = submissionRepository
            .findByCompetitionIdAndClimberIdWithRoutes(comp.getId(), climber.getId())
            .orElseGet(() -> {
                Submission s = new Submission();
                s.setClimber(climber);
                s.setCompetition(comp);
                s.setRoutes(new ArrayList<>());
                return s;
            });

        submission.setCompetitorGroup(dto.competitorGroup());
        submission.setDivision(dto.division());

        Map<Long, SubmittedRoute> routeMap = submission.getRoutes().stream()
            .collect(Collectors.toMap(sr -> sr.getRoute().getId(), sr -> sr));

        for (SubmittedRouteDto routeDto : dto.routes()) {
            Route route = routeService.getById(routeDto.routeId());
            if (route == null) throw new RuntimeException("Route not found: ID " + routeDto.routeId());

            SubmittedRoute existing = routeMap.get(routeDto.routeId());
            if (existing != null) {
                existing.setAttempts(routeDto.attempts());
                existing.setSend(routeDto.send());
            } else {
                SubmittedRoute newRoute = new SubmittedRoute();
                newRoute.setRoute(route);
                newRoute.setAttempts(routeDto.attempts());
                newRoute.setSend(routeDto.send());
                newRoute.setSubmission(submission);
                submission.getRoutes().add(newRoute);
            }
        }

        Submission saved = submissionRepository.saveAndFlush(submission);

        // Map to DTO inside the same transaction
        List<SubmittedRouteDto> routeDtos = saved.getRoutes().stream()
            .map(sr -> new SubmittedRouteDto(sr.getRoute().getId(), sr.getAttempts(), sr.isSend()))
            .toList();

        return new SubmissionResponseDto(saved.getId(), comp.getId(), climber.getId(), routeDtos);
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

    public List<Submission> getRankedSubmissions(Long compId) {
        List<Submission> all = submissionRepository.findByCompetitionId(compId).orElse(null);
        if (all == null) return null;
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
        if (ranked == null) return null;
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
            
            results.add(new RankedSubmissionDto(place++, s.getClimber().getName(), getTotalScore(s), points, attempts, s.getCompetitorGroup(), s.getDivision()));
        }
        return results;
    }

    public List<ClimberScoreDto> getScoresForUser(Long climberId) {
        List<Submission> subs = submissionRepository.findByClimberId(climberId).orElse(null);
        if (subs == null) return null;
        
        return subs.stream().map(s -> new ClimberScoreDto(
            climberId,
            s.getCompetition().getId(),
            getTotalScore(s)
        )).toList();
    }
    
    public List<RegionalScoreDto> getSeriesalLeaderboard() {
        Map<Climber, Integer> pointsMap = new HashMap<>();

        List<Competition> competitions = compService.getAll();
        for (Competition comp : competitions) {
            List<Submission> ranked = getRankedSubmissions(comp.getId());
            if (ranked == null) return null;

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
    
    public List<RankedSubmissionDto> getRankingsByGroupAndDivision(Long competitionId, CompetitorGroup group, Gender division) {
        List<Submission> allSubs = submissionRepository.findByCompetitionId(competitionId).orElse(List.of());
        List<RankedSubmissionDto> results = new ArrayList<>();

        // Build map of climberId → Registration for filtering
        Map<Long, Registration> regMap = compService.getByIdWithRegistrations(competitionId)
            .getRegistrations()
            .stream()
            .filter(r -> r.getCompetitorGroup() == group && (division == null || r.getDivision() == division))
            .collect(Collectors.toMap(r -> r.getClimber().getId(), Function.identity()));

        // Collect into a mutable list to allow sorting
        List<Submission> filteredSubs = allSubs.stream()
            .filter(sub -> regMap.containsKey(sub.getClimber().getId()))
            .collect(Collectors.toCollection(ArrayList::new));  // Changed here

        filteredSubs.sort((a, b) -> {
            int scoreA = getTotalScore(a);
            int scoreB = getTotalScore(b);
            if (scoreA != scoreB) return Integer.compare(scoreB, scoreA);

            int[] tieA = getTiebreakKey(a);
            int[] tieB = getTiebreakKey(b);
            for (int i = 0; i < Math.min(tieA.length, tieB.length); i++) {
                if (tieA[i] != tieB[i]) return Integer.compare(tieA[i], tieB[i]);
            }
            return 0;
        });

        int place = 1;
        for (Submission s : filteredSubs) {
            List<SubmittedRoute> sorted = s.getRoutes().stream()
                .sorted(Comparator.comparingInt((SubmittedRoute r) -> r.getRoute().getPointValue()).reversed())
                .toList();

            List<Integer> points = sorted.stream().map(r -> r.getRoute().getPointValue()).toList();
            List<Integer> attempts = sorted.stream().map(SubmittedRoute::getAttempts).toList();

            Registration reg = regMap.get(s.getClimber().getId());
            CompetitorGroup regGroup = reg.getCompetitorGroup();
            Gender regDivision = reg.getDivision();

            results.add(new RankedSubmissionDto(
                place++,
                s.getClimber().getName(),
                getTotalScore(s),
                points,
                attempts,
                regGroup,
                regDivision
            ));
        }

        return results;
    }

}

package com.cruxpass.services;

import com.cruxpass.dtos.RankedSubmissionDto;
import com.cruxpass.dtos.SubmittedRouteDto;
import com.cruxpass.dtos.requests.SubmissionRequestDto;
import com.cruxpass.dtos.responses.SubmissionResponseDto;
import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Division;
import com.cruxpass.models.Competition;
import com.cruxpass.models.RankingInfo;
import com.cruxpass.models.Route;
import com.cruxpass.models.Submission;
import com.cruxpass.models.SubmittedRoute;
import com.cruxpass.models.Climber;
import com.cruxpass.repositories.SubmissionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SubmissionService {
    
    private final SubmissionRepository submissionRepository;
    private final RouteService routeService;

    public SubmissionService(
        SubmissionRepository submissionRepository,
        RouteService routeService,
        CompetitionService compService,
        ClimberService climberService
    ) {
        this.submissionRepository = submissionRepository;
        this.routeService = routeService;
    }

    public List<Submission> getAll() {
        return submissionRepository.findAll();
    }

    public Submission getById(Long id) {
        return submissionRepository.findById(id).orElse(null);
    }

    public Submission getByCompetitionIdAndClimberId(Long compId, Long climberId) {
        Submission subs = submissionRepository.findByCompetitionIdAndClimberIdWithRoutes(compId, climberId).orElse(null);
        return subs;
    }

    @Transactional
    public SubmissionResponseDto submitOrUpdateScores(Competition comp, Climber climber, SubmissionRequestDto dto) {
        if (climber == null || comp == null) return null;

        Submission submission = submissionRepository
            .findByCompetitionIdAndClimberIdWithRoutes(comp.getId(), climber.getId())
            .orElse(null);

        if (submission == null) {
            submission = new Submission();
            submission.setClimber(climber);
            submission.setCompetition(comp);
            submission.setRoutes(new ArrayList<>());
        }

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

        List<SubmittedRouteDto> routeDtos = saved.getRoutes().stream()
            .map(sr -> new SubmittedRouteDto(sr.getRoute().getId(), sr.getAttempts(), sr.isSend()))
            .toList();

        return new SubmissionResponseDto(saved.getId(), comp.getId(), climber.getId(), routeDtos);
    }

    // ------------------- RANKING PIPELINE -------------------
    private RankingInfo toRankingInfo(Submission sub) {
        // only count SENT routes
        List<SubmittedRoute> sentRoutes = sub.getRoutes().stream()
            .filter(SubmittedRoute::isSend)
            .toList();

        // sort routes: by points desc, then attempts asc
        List<SubmittedRoute> sortedRoutes = sentRoutes.stream()
            .sorted(Comparator
                .comparingInt((SubmittedRoute sr) -> sr.getRoute().getPointValue()).reversed()
                .thenComparingInt(SubmittedRoute::getAttempts))
            .toList();

        // pick top 6
        List<SubmittedRoute> top6 = sortedRoutes.stream().limit(6).toList();

        List<Integer> points = top6.stream()
            .map(sr -> sr.getRoute().getPointValue())
            .toList();

        List<Integer> attempts = top6.stream()
            .map(SubmittedRoute::getAttempts)
            .toList();

        int totalPoints = points.stream().limit(5).mapToInt(Integer::intValue).sum();
        int totalAttempts = attempts.stream().limit(5).mapToInt(Integer::intValue).sum();

        return new RankingInfo(
            0, // place assigned later
            sub.getClimber().getId(),
            sub.getClimber().getName(),
            totalPoints,
            totalAttempts,
            points,
            attempts,
            sub.getCompetitorGroup(),
            sub.getDivision()
        );
    }

    private int compareForRanking(RankingInfo a, RankingInfo b) {
        // 1. Total points 
        int cmp = Integer.compare(b.totalPoints(), a.totalPoints());
        if (cmp != 0) return cmp;

        // 2. Total attempts
        cmp = Integer.compare(a.totalAttempts(), b.totalAttempts());
        if (cmp != 0) return cmp;

        // 3. Points on top 5 routes (desc)
        for (int i = 0; i < 5 && i < a.topPoints().size() && i < b.topPoints().size(); i++) {
            cmp = Integer.compare(b.topPoints().get(i), a.topPoints().get(i));
            if (cmp != 0) return cmp;
        }

        // 4. Attempts on top 5 routes (asc)
        for (int i = 0; i < 5 && i < a.topAttempts().size() && i < b.topAttempts().size(); i++) {
            cmp = Integer.compare(a.topAttempts().get(i), b.topAttempts().get(i));
            if (cmp != 0) return cmp;
        }

        // 5. 6th route points (desc)
        if (a.topPoints().size() >= 6 && b.topPoints().size() >= 6) {
            cmp = Integer.compare(b.topPoints().get(5), a.topPoints().get(5));
            if (cmp != 0) return cmp;

            // 6. 6th route attempts (asc)
            cmp = Integer.compare(a.topAttempts().get(5), b.topAttempts().get(5));
            if (cmp != 0) return cmp;
        }

        return 0; // fully tied
    }

    private List<RankedSubmissionDto> assignPlaces(List<RankingInfo> ranked) {
        List<RankedSubmissionDto> result = new ArrayList<>();
        int place = 1;

        for (int i = 0; i < ranked.size(); ) {
            RankingInfo current = ranked.get(i);

            // group all tied
            int j = i + 1;
            while (j < ranked.size() && compareForRanking(current, ranked.get(j)) == 0) {
                j++;
            }

            // assign same place to [i, j)
            for (int k = i; k < j; k++) {
                RankingInfo tied = ranked.get(k);
                result.add(new RankedSubmissionDto(
                    place,
                    tied.climberId(),
                    tied.climberName(),
                    tied.totalPoints(),
                    tied.totalAttempts(),
                    tied.competitorGroup(),
                    tied.division()
                ));
            }

            // advance and bump place (handles 1,2,2,4 correctly)
            int tiedCount = j - i;
            i = j;
            place += tiedCount;
        }

        return result;
    }

    private List<RankedSubmissionDto> rankSubmissions(List<Submission> submissions) {
        if (submissions == null) return Collections.emptyList();

        List<RankingInfo> infos = submissions.stream()
            .map(this::toRankingInfo)
            .sorted(this::compareForRanking)
            .toList();

        return assignPlaces(infos);
    }

    // ------------------- PUBLIC API -------------------

    public List<RankedSubmissionDto> getRankings(Long compId) {
        List<Submission> submissions = submissionRepository
            .findByCompetitionId(compId)
            .orElse(Collections.emptyList());
        return rankSubmissions(submissions);
    }

    public List<RankedSubmissionDto> getRankingsByGroupAndDivision(
        Long competitionId,
        CompetitorGroup group,
        Division division
    ) {
        List<Submission> submissions = submissionRepository
            .findByCompetitionIdAndGroupAndDivision(competitionId, group, division)
            .orElse(Collections.emptyList());
        return rankSubmissions(submissions);
    }
}

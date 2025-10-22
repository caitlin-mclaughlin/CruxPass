package com.cruxpass.controllers;

import com.cruxpass.dtos.RankedSubmissionDto;
import com.cruxpass.dtos.SubmittedRouteDto;
import com.cruxpass.dtos.requests.SubmissionRequestDto;
import com.cruxpass.dtos.responses.SubmissionResponseDto;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.mappers.SubmissionMapper;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Submission;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.CompetitionService;
import com.cruxpass.services.LeaderboardBroadcastService;
import com.cruxpass.services.SubmissionService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/gyms/{gymId}/competitions/{competitionId}/submissions")
public class CompSubmissionController {

    private final CompetitionService competitionService;
    private final SubmissionService submissionService;
    private final CurrentUserService currentUserService;
    private final LeaderboardBroadcastService leaderboardService;
    @Autowired
    private SubmissionMapper subMap;

    public CompSubmissionController(
        CompetitionService competitionService,
        SubmissionService submissionService,
        CurrentUserService currentUserService,
        LeaderboardBroadcastService leaderboardService) {
        this.competitionService = competitionService;
        this.submissionService = submissionService;
        this.currentUserService = currentUserService;
        this.leaderboardService = leaderboardService;
    }
    /*
    @GetMapping()
    public ResponseEntity<List<CompetitionResponseDto>> getAllSubmissionsForComp(
            @PathVariable Long gymId,
            @PathVariable Long competitionId) {
        
        List<Competition> comps = submissionService.get(gymId);
        if (comps == null) return null;

        return ResponseEntity.ok(comps.stream()
            .map(comp -> compMap.toResponseDto(comp))
            .toList());
    }*/

    @PutMapping("/me")
    public ResponseEntity<?> submitOrUpdateScore(
        @RequestBody SubmissionRequestDto dto,
        @PathVariable Long gymId,
        @PathVariable Long competitionId,
        @RequestHeader("Authorization") String authHeader
    ) {
        Climber climber = currentUserService.getClimberFromToken(authHeader);
        if (climber == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized climber");

        Competition comp = competitionService.getById(competitionId).orElse(null);
        if (comp == null) return ResponseEntity.notFound().build();
        if (comp.getGym().getId() != gymId) return ResponseEntity.badRequest().build();

        if (comp.getCompStatus() != CompetitionStatus.LIVE) {
            return ResponseEntity.badRequest().body("Competition is not live.");
        }

        SubmissionResponseDto response = submissionService.submitOrUpdateScores(comp, climber, dto);
        leaderboardService.handleNewSubmission(competitionId, climber.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<SubmittedRouteDto>> getMyScores(
        @PathVariable Long gymId,
        @PathVariable Long competitionId,
        @RequestHeader("Authorization") String authHeader
    ) {
        Climber climber = currentUserService.getClimberFromToken(authHeader);
        if (climber == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Submission sub = submissionService.getByCompetitionIdAndClimberId(competitionId, climber.getId());
        if (sub == null) return ResponseEntity.notFound().build();
        
        List<SubmittedRouteDto> submittedRoutes = sub.getRoutes().stream()
            .map(subMap::toSubmittedRouteDto)
            .toList();

        return ResponseEntity.ok(submittedRoutes);
    }

    @GetMapping("/{id}/rankings")
    public ResponseEntity<List<RankedSubmissionDto>> getRankings(
        @PathVariable Long id,
        @PathVariable Long gymId,
        @PathVariable Long competitionId,
        @RequestHeader("Authorization") String authHeader
    ) {
        List<RankedSubmissionDto> dtos = submissionService.getRankings(id);
        if (dtos == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(dtos);
    }
/*
    @GetMapping("/leaderboard")
    public ResponseEntity<List<RegionalScoreDto>> regionalLeaderboard(
        @PathVariable Long gymId,
        @PathVariable Long competitionId,
        @RequestHeader("Authorization") String authHeader
    ) {
        currentUserService.validateGymAccess(gymId, authHeader);

        List<RegionalScoreDto> dtos = submissionService.getSeriesalLeaderboard();
        if (dtos == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(dtos);
    }*/
}

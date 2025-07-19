package com.cruxpass.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cruxpass.dtos.RankedSubmissionDto;
import com.cruxpass.dtos.RegionalScoreDto;
import com.cruxpass.dtos.requests.SubmissionRequestDto;
import com.cruxpass.dtos.ClimberScoreDto;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.SubmissionService;

@RestController
@RequestMapping("/api/gyms/{gymId}/competitions/{competitionId}/submissions")
public class CompSubmissionController {

    private final SubmissionService submissionService;
    private final CurrentUserService currentUserService;

    public CompSubmissionController(SubmissionService submissionService, CurrentUserService currentUserService) {
        this.submissionService = submissionService;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submitScore(
        @PathVariable Long id,
        @RequestBody SubmissionRequestDto dto,
        @PathVariable Long gymId,
        @PathVariable Long competitionId,
        @RequestHeader("Authorization") String authHeader
    ) {
        currentUserService.validateGymAccess(gymId, authHeader);

        String email = currentUserService.extractEmail(authHeader);
        try {
            submissionService.submitScore(id, email, dto);
            return ResponseEntity.ok("Score submitted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/rankings")
    public ResponseEntity<List<RankedSubmissionDto>> getRankings(
        @PathVariable Long id,
        @PathVariable Long gymId,
        @PathVariable Long competitionId,
        @RequestHeader("Authorization") String authHeader
    ) {
        currentUserService.validateGymAccess(gymId, authHeader);


        List<RankedSubmissionDto> dtos = submissionService.getRankings(id);
        if (dtos == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/me/scores")
    public ResponseEntity<List<ClimberScoreDto>> getMyScores(
        @PathVariable Long gymId,
        @PathVariable Long competitionId,
        @RequestHeader("Authorization") String authHeader
    ) {
        currentUserService.validateGymAccess(gymId, authHeader);

        String email = currentUserService.extractEmail(authHeader);
        List<ClimberScoreDto> dtos = submissionService.getScoresForUser(email);
        if (dtos == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(dtos);
    }

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
    }

}

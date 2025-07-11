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
import com.cruxpass.dtos.SubmissionRequestDto;
import com.cruxpass.dtos.UserScoreDto;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.security.JwtUtil;
import com.cruxpass.services.SubmissionService;

@RestController
@RequestMapping("/api/competitions")
public class SubmissionController {

    private final SubmissionService submissionService;
    private final CurrentUserService currentUserService;

    public SubmissionController(SubmissionService submissionService, CurrentUserService currentUserService) {
        this.submissionService = submissionService;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submitScore(
            @PathVariable Long id,
            @RequestBody SubmissionRequestDto dto,
            @RequestHeader("Authorization") String authHeader) {

        String email = currentUserService.extractEmail(authHeader);
        try {
            submissionService.submitScore(id, email, dto);
            return ResponseEntity.ok("Score submitted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/rankings")
    public List<RankedSubmissionDto> getRankings(@PathVariable Long id) {
        return submissionService.getRankings(id);
    }

    @GetMapping("/me/scores")
    public List<UserScoreDto> getMyScores(@RequestHeader("Authorization") String authHeader) {
        String email = currentUserService.extractEmail(authHeader);
        return submissionService.getScoresForUser(email);
    }

    @GetMapping("/leaderboard")
    public List<RegionalScoreDto> regionalLeaderboard() {
        return submissionService.getSeriesalLeaderboard();
    }

}

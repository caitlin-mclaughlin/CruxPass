package com.cruxpass.controllers;

import com.cruxpass.annotations.CurrentClimber;
import com.cruxpass.dtos.RankedSubmissionDto;
import com.cruxpass.dtos.SubmittedRouteDto;
import com.cruxpass.dtos.requests.SubmissionRequestDto;
import com.cruxpass.dtos.responses.SubmissionResponseDto;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.mappers.SubmissionMapper;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Submission;
import com.cruxpass.services.CompetitionService;
import com.cruxpass.services.LeaderboardBroadcastService;
import com.cruxpass.services.SubmissionService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/competitions/{compId}/submissions")
public class CompSubmissionController {

    private final CompetitionService competitionService;
    private final SubmissionService submissionService;
    private final LeaderboardBroadcastService leaderboardService;
    @Autowired
    private SubmissionMapper subMap;

    @PutMapping("/me")
    public ResponseEntity<SubmissionResponseDto> submitOrUpdateScore(
        @RequestBody SubmissionRequestDto dto,
        @PathVariable Long compId,
        @CurrentClimber Climber climber
    ) {
        Competition comp = competitionService.getById(compId);
        if (comp == null) return ResponseEntity.notFound().build();

        if (comp.getCompStatus() != CompetitionStatus.LIVE) {
            return ResponseEntity.badRequest().build();
        }

        SubmissionResponseDto response;
        try {
            response = submissionService.submitOrUpdateScores(comp, climber, dto);
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().build();
        }
        leaderboardService.handleNewSubmission(compId, climber.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<SubmittedRouteDto>> getMyScores(
        @PathVariable Long compId,
        @CurrentClimber Climber climber
    ) {
        Submission sub = submissionService.getByCompetitionIdAndClimberId(compId, climber.getId());
        if (sub == null) return ResponseEntity.notFound().build();
        
        List<SubmittedRouteDto> submittedRoutes = sub.getRoutes().stream()
            .map(subMap::toSubmittedRouteDto)
            .toList();

        return ResponseEntity.ok(submittedRoutes);
    }

    @GetMapping("/{id}/rankings")
    public ResponseEntity<List<RankedSubmissionDto>> getRankings(
        @PathVariable Long id,
        @PathVariable Long compId
    ) {
        if (!id.equals(compId)) return ResponseEntity.badRequest().build();
        List<RankedSubmissionDto> dtos = submissionService.getRankings(compId);
        if (dtos == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/rankings")
    public ResponseEntity<List<RankedSubmissionDto>> getRankingsForCompetition(
        @PathVariable Long compId
    ) {
        return ResponseEntity.ok(submissionService.getRankings(compId));
    }
}

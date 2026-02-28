package com.cruxpass.services;

import com.cruxpass.dtos.GroupLeaderboardUpdateDto;
import com.cruxpass.dtos.LiveSubmissionEventDto;
import com.cruxpass.dtos.RankedSubmissionDto;
import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.Division;
import com.cruxpass.events.SubmissionUpdatedEvent;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Registration;
import com.cruxpass.models.Submission;
import com.cruxpass.models.SubmittedRoute;

import lombok.RequiredArgsConstructor;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardBroadcastService {

    private final SimpMessagingTemplate messagingTemplate;
    private final SubmissionService submissionService;
    private final RegistrationService registrationService;
    private final ClimberService climberService;

    @Async
    @EventListener
    public void onSubmissionUpdated(SubmissionUpdatedEvent event) {
        handleNewSubmission(
            event.getCompetitionId(),
            event.getClimberId(),
            event.getRouteId()
        );
    }

    public void handleNewSubmission(Long competitionId, Long climberId) {
        // For backward compatibility: just broadcast leaderboard
        Registration registration = registrationService.getByClimberIdAndCompetitionId(climberId, competitionId);
        if (registration == null) throw new IllegalStateException("Climber not registered");

        broadcastGroupLeaderboard(competitionId, registration.getCompetitorGroup(), registration.getDivision());
    }
    
    public void handleNewSubmission(Long competitionId, Long climberId, Long routeId) {
        // 1. Validate registration
        Registration registration = registrationService.getByClimberIdAndCompetitionId(climberId, competitionId);
        if (registration == null) throw new IllegalStateException("Climber not registered");

        DefaultCompetitorGroup group = registration.getCompetitorGroup();
        Division division = registration.getDivision();

        // 2. Fetch climber info
        Climber climber = climberService.getById(climberId);
        String climberName = climber.getName();

        // 3. Get updated submission totals
        Submission submission = submissionService.getByCompetitionIdAndClimberId(competitionId, climberId);

        // Find the updated route if you track individual route attempts
        SubmittedRoute route = submission.getRoutes().stream()
            .filter(r -> r.getRoute().getId().equals(routeId))
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("Route not found in submission"));

        // 4. Build event DTO
        LiveSubmissionEventDto event = new LiveSubmissionEventDto(
            competitionId,
            climberId,
            climberName,
            group,
            division,
            route.getRoute().getId(),
            route.getRoute().getNumber(),
            route.getRoute().getPointValue(),
            route.getAttempts(),
            submission.getTotalPoints(),
            submission.getTotalAttempts(),
            Instant.now()
        );

        // 5. Send to all clients subscribed to this competition
        messagingTemplate.convertAndSend(
            "/topic/submissions/" + competitionId,
            event
        );

        // 6. Optionally still send the group leaderboard update
        broadcastGroupLeaderboard(competitionId, group, division);
    }

    public void broadcastGroupLeaderboard(Long competitionId, DefaultCompetitorGroup group, Division division) {
        List<RankedSubmissionDto> rankings =
            submissionService.getRankingsByGroupAndDivision(competitionId, group, division);

        GroupLeaderboardUpdateDto update = new GroupLeaderboardUpdateDto(
            competitionId,
            group,
            division,
            rankings
        );

        messagingTemplate.convertAndSend(
            "/topic/leaderboard/" + competitionId + "/" + group + "/" + division,
            update
        );
    }
}

package com.cruxpass.services;

import com.cruxpass.dtos.GroupLeaderboardUpdateDto;
import com.cruxpass.dtos.RankedSubmissionDto;
import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Division;
import com.cruxpass.models.Registration;

import lombok.RequiredArgsConstructor;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardBroadcastService {
    private final SimpMessagingTemplate messagingTemplate;
    private final SubmissionService submissionService;
    private final RegistrationService registrationService;

    public void handleNewSubmission(Long competitionId, Long climberId) {
        Registration registration = registrationService.getByClimberIdAndCompetitionId(climberId, competitionId);
        if (registration == null) throw new IllegalStateException("Climber not registered");

        CompetitorGroup group = registration.getCompetitorGroup();
        Division division = registration.getDivision();

        // Calculate leaderboard only for that group/division
        List<RankedSubmissionDto> rankings = getRankings(competitionId, group, division);

        GroupLeaderboardUpdateDto update = new GroupLeaderboardUpdateDto(
            competitionId,
            group,
            division,
            rankings
        );

        System.out.println("Sending leaderboard update to: /topic/leaderboard/" + competitionId + "/"+ group + "/"+ division);

        // Send only this group’s leaderboard
        messagingTemplate.convertAndSend(
            "/topic/leaderboard/" + competitionId + "/" + group + "/" + division,
            update
        );
    }

    // Existing ranking logic, but scoped to compId + group + division
    public List<RankedSubmissionDto> getRankings(Long compId, CompetitorGroup group, Division division) {
        // fetch submissions + calculate places as you already do
        return submissionService.getRankingsByGroupAndDivision(compId, group, division);
    }
}

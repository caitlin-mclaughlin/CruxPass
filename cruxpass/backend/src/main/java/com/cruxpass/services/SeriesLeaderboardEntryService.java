package com.cruxpass.services;

import com.cruxpass.models.*;
import com.cruxpass.dtos.RankedSubmissionDto;
import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Gender;
import com.cruxpass.repositories.SeriesLeaderboardEntryRepository;
import com.cruxpass.repositories.SeriesRegistrationRepository;
import com.cruxpass.utils.SeriesLeaderboardComparator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeriesLeaderboardEntryService {

    private final SeriesLeaderboardEntryRepository leaderboardRepository;
    private final SeriesRegistrationRepository registrationRepository;
    private final SubmissionService submissionService;

    private final SeriesService seriesService;

    /**
     * Rebuild the leaderboard for a series (after a competition ends or scores are finalized)
     */
    @Transactional
    public List<SeriesLeaderboardEntry> rebuildLeaderboard(Long seriesId, CompetitorGroup group, Gender division) {
        Series series = seriesService.getById(seriesId);

        // Fetch all series registrations for this group/division
        List<SeriesRegistration> registrations = registrationRepository
                .findBySeriesIdAndCompetitorGroupAndDivision(seriesId, group, division);

        // Map: climberId -> leaderboard entry
        Map<Long, SeriesLeaderboardEntry> leaderboardMap = new HashMap<>();

        // Initialize entries for all series participants
        for (SeriesRegistration reg : registrations) {
            SeriesLeaderboardEntry entry = new SeriesLeaderboardEntry();
            entry.setSeries(series);
            entry.setClimber(reg.getClimber());
            entry.setCompetitorGroup(group);
            entry.setDivision(division);
            entry.setTotalSeriesPoints(0);
            entry.setRawClimbingPoints(0);
            entry.setTotalAttempts(0);
            entry.setPlacementCounts(new ArrayList<>());
            entry.setResults(new ArrayList<>());
            leaderboardMap.put(reg.getClimber().getId(), entry);
        }

        // Process all competitions in the series
        for (Competition comp : series.getCompetitions()) {
            // Fetch ranking for this comp/group/division
            List<RankedSubmissionDto> rankings = submissionService.getRankingsByGroupAndDivision(comp.getId(), group, division);

            // Walk through full ranking list and award series points by absolute placement
            for (int i = 0; i < rankings.size(); i++) {
                RankedSubmissionDto r = rankings.get(i);
                int placement = i + 1; // absolute placement in competition

                SeriesLeaderboardEntry entry = leaderboardMap.get(r.climberId());
                if (entry == null) continue; // not a series participant

                int seriesPoints = switch (placement) {
                    case 1 -> 100;
                    case 2 -> 90;
                    case 3 -> 80;
                    case 4 -> 70;
                    case 5 -> 60;
                    case 6 -> 50;
                    case 7 -> 40;
                    case 8 -> 30;
                    case 9 -> 20;
                    case 10 -> 10;
                    default -> 0;
                };

                entry.addCompetitionResult(
                        comp.getId(),
                        comp.getName(),
                        placement,   // absolute placement
                        seriesPoints,
                        r.totalPoints(),
                        r.totalAttempts()
                );
            }
        }

        // Sort entries using your comparator
        List<SeriesLeaderboardEntry> sorted = leaderboardMap.values().stream()
                .sorted(new SeriesLeaderboardComparator())
                .collect(Collectors.toList());

        // Update rank and persist
        int rank = 1;
        for (SeriesLeaderboardEntry entry : sorted) {
            entry.setRank(rank++);
            leaderboardRepository.save(entry);
        }

        return sorted;
    }

    /**
     * Fetch the leaderboard for a series, group, and division
     */
    public List<SeriesLeaderboardEntry> getLeaderboard(Long seriesId, CompetitorGroup group, Gender division) {
        return leaderboardRepository.findBySeriesIdAndCompetitorGroupAndDivisionOrderByRankAsc(seriesId, group, division);
    }

    /**
     * Optional: fetch entire series leaderboard across all groups/divisions
     */
    public List<SeriesLeaderboardEntry> getLeaderboard(Long seriesId) {
        return leaderboardRepository.findBySeriesIdOrderByRankAsc(seriesId);
    }
}

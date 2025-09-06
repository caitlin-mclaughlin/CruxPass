package com.cruxpass.repositories;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Gender;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Series;
import com.cruxpass.models.SeriesLeaderboardEntry;

@Repository
public interface SeriesLeaderboardEntryRepository extends JpaRepository<SeriesLeaderboardEntry, Long> {

    // Leaderboard for group/division
    List<SeriesLeaderboardEntry> findAllBySeriesAndCompetitorGroupAndDivision(
        Series series,
        CompetitorGroup group,
        Gender division
    );

    // Lookup climber's leaderboard entry
    Optional<SeriesLeaderboardEntry> findBySeriesAndClimber(Series series, Climber climber);

    List<SeriesLeaderboardEntry> findBySeriesIdAndCompetitorGroupAndDivisionOrderByRankAsc(Long seriesId, CompetitorGroup group, Gender division);
    List<SeriesLeaderboardEntry> findBySeriesIdOrderByRankAsc(Long seriesId);
}


package com.cruxpass.repositories;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.Division;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Series;
import com.cruxpass.models.SeriesLeaderboardEntry;

@Repository
public interface SeriesLeaderboardEntryRepository extends JpaRepository<SeriesLeaderboardEntry, Long> {

    // Leaderboard for group/division
    List<SeriesLeaderboardEntry> findAllBySeriesAndCompetitorGroupAndDivision(
        Series series,
        DefaultCompetitorGroup group,
        Division division
    );

    // Lookup climber's leaderboard entry
    Optional<SeriesLeaderboardEntry> findBySeriesAndClimber(Series series, Climber climber);

    List<SeriesLeaderboardEntry> findBySeriesIdAndCompetitorGroupAndDivisionOrderByRankAsc(Long seriesId, DefaultCompetitorGroup group, Division division);
    List<SeriesLeaderboardEntry> findBySeriesIdOrderByRankAsc(Long seriesId);
}


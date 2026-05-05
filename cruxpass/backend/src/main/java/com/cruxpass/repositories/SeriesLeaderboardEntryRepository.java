package com.cruxpass.repositories;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.Division;
import com.cruxpass.enums.GroupRefType;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Series;
import com.cruxpass.models.SeriesLeaderboardEntry;

@Repository
public interface SeriesLeaderboardEntryRepository extends JpaRepository<SeriesLeaderboardEntry, Long> {

    @Query("""
        SELECT e
        FROM SeriesLeaderboardEntry e
        WHERE e.series = :series
          AND e.competitorGroupRef.type = :type
          AND (
            (:type = com.cruxpass.enums.GroupRefType.DEFAULT AND e.competitorGroupRef.defaultKey = :defaultGroup)
            OR (:type = com.cruxpass.enums.GroupRefType.CUSTOM AND e.competitorGroupRef.customGroupId = :customGroupId)
          )
          AND e.division = :division
        ORDER BY e.rank ASC
    """)
    List<SeriesLeaderboardEntry> findAllBySeriesAndGroupRefAndDivision(
        @Param("series") Series series,
        @Param("type") GroupRefType type,
        @Param("defaultGroup") DefaultCompetitorGroup defaultGroup,
        @Param("customGroupId") Long customGroupId,
        @Param("division") Division division
    );

    // Lookup climber's leaderboard entry
    Optional<SeriesLeaderboardEntry> findBySeriesAndClimber(Series series, Climber climber);

    @Query("""
        SELECT e
        FROM SeriesLeaderboardEntry e
        WHERE e.series.id = :seriesId
          AND e.competitorGroupRef.type = :type
          AND (
            (:type = com.cruxpass.enums.GroupRefType.DEFAULT AND e.competitorGroupRef.defaultKey = :defaultGroup)
            OR (:type = com.cruxpass.enums.GroupRefType.CUSTOM AND e.competitorGroupRef.customGroupId = :customGroupId)
          )
          AND e.division = :division
        ORDER BY e.rank ASC
    """)
    List<SeriesLeaderboardEntry> findBySeriesIdAndGroupRefAndDivisionOrderByRankAsc(
        @Param("seriesId") Long seriesId,
        @Param("type") GroupRefType type,
        @Param("defaultGroup") DefaultCompetitorGroup defaultGroup,
        @Param("customGroupId") Long customGroupId,
        @Param("division") Division division
    );
    List<SeriesLeaderboardEntry> findBySeriesIdOrderByRankAsc(Long seriesId);
}

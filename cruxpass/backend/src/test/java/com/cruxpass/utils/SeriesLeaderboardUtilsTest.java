package com.cruxpass.utils;

import static com.cruxpass.support.TestFixtures.leaderboardEntry;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;

class SeriesLeaderboardUtilsTest {

    @Test
    void assignRanksSortsBySeriesPointsThenRawPointsThenAttempts() {
        var entries = new ArrayList<>(List.of(
            leaderboardEntry("Casey", 90, List.of(0, 1), 450, 8),
            leaderboardEntry("Avery", 100, List.of(1), 400, 10),
            leaderboardEntry("Blake", 100, List.of(1), 410, 12),
            leaderboardEntry("Devon", 100, List.of(1), 410, 9)
        ));

        SeriesLeaderboardUtils.assignRanks(entries);

        assertEquals("Devon", entries.get(0).getClimber().getName());
        assertEquals(1, entries.get(0).getRank());
        assertEquals("Blake", entries.get(1).getClimber().getName());
        assertEquals(2, entries.get(1).getRank());
        assertEquals("Avery", entries.get(2).getClimber().getName());
        assertEquals(3, entries.get(2).getRank());
        assertEquals("Casey", entries.get(3).getClimber().getName());
        assertEquals(4, entries.get(3).getRank());
    }

    @Test
    void assignRanksGivesSameRankWhenComparatorCannotSeparateEntries() {
        var entries = new ArrayList<>(List.of(
            leaderboardEntry("Avery", 100, List.of(1), 400, 10),
            leaderboardEntry("avery", 100, List.of(1), 400, 10)
        ));

        SeriesLeaderboardUtils.assignRanks(entries);

        assertEquals(1, entries.get(0).getRank());
        assertEquals(1, entries.get(1).getRank());
    }
}

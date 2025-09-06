package com.cruxpass.utils;

import com.cruxpass.models.SeriesLeaderboardEntry;
import java.util.Comparator;
import java.util.List;

public class SeriesLeaderboardComparator implements Comparator<SeriesLeaderboardEntry> {

    @Override
    public int compare(SeriesLeaderboardEntry a, SeriesLeaderboardEntry b) {
        // 1. Total series points
        int cmp = Integer.compare(b.getTotalSeriesPoints(), a.getTotalSeriesPoints());
        if (cmp != 0) return cmp;

        // 2. Placement counts (1st place, then 2nd, etc.)
        cmp = comparePlacements(a.getPlacementCounts(), b.getPlacementCounts());
        if (cmp != 0) return cmp;

        // 3. Raw climbing points
        cmp = Integer.compare(b.getRawClimbingPoints(), a.getRawClimbingPoints());
        if (cmp != 0) return cmp;

        // 4. Attempts (fewer is better)
        cmp = Integer.compare(a.getTotalAttempts(), b.getTotalAttempts());
        if (cmp != 0) return cmp;

        // 5. Fallback: climber name
        return a.getClimber().getName().compareToIgnoreCase(b.getClimber().getName());
    }

    private int comparePlacements(List<Integer> aPlacements, List<Integer> bPlacements) {
        int maxSize = Math.max(aPlacements.size(), bPlacements.size());
        for (int i = 0; i < maxSize; i++) {
            int aCount = (i < aPlacements.size()) ? aPlacements.get(i) : 0;
            int bCount = (i < bPlacements.size()) ? bPlacements.get(i) : 0;

            // Higher count wins (more 1st, more 2nd, etc.)
            int cmp = Integer.compare(bCount, aCount);
            if (cmp != 0) return cmp;
        }
        return 0;
    }
}

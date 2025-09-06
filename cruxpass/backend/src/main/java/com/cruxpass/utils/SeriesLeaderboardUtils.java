package com.cruxpass.utils;

import java.util.List;

import com.cruxpass.models.SeriesLeaderboardEntry;

public class SeriesLeaderboardUtils {

    public static void assignRanks(List<SeriesLeaderboardEntry> entries) {
        entries.sort(new SeriesLeaderboardComparator());

        int currentRank = 1;
        for (int i = 0; i < entries.size(); i++) {
            if (i > 0 && new SeriesLeaderboardComparator().compare(entries.get(i), entries.get(i - 1)) == 0) {
                // Tie: same rank as previous
                entries.get(i).setRank(entries.get(i - 1).getRank());
            } else {
                entries.get(i).setRank(currentRank);
            }
            currentRank++;
        }
    }
}

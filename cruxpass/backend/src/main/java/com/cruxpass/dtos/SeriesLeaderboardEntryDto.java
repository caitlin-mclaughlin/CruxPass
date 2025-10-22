package com.cruxpass.dtos;

import java.util.List;

import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Division;
import com.cruxpass.models.CompetitionResult;

public record SeriesLeaderboardEntryDto(
    Long climberId,
    CompetitorGroup group,
    Division division,
    String climberName,
    int totalSeriesPoints,
    int rawClimbingPoints,
    int totalAttempts,
    Integer rank,
    List<Integer> placementCounts, // index 0 = 1st place count, etc.
    List<CompetitionResult> results
) {}


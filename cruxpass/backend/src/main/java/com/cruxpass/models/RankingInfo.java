package com.cruxpass.models;

import java.util.List;

import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.Division;

public record RankingInfo(
    int place,
    Long climberId,
    String climberName,
    int totalPoints, // sum of top 5
    int totalAttempts, // sum of top 5
    List<Integer> topPoints,
    List<Integer> topAttempts,
    DefaultCompetitorGroup competitorGroup,
    Division division
) {}

package com.cruxpass.dtos;

import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.Division;

public record RankedSubmissionDto(
    int place,
    Long climberId,
    String climberName,
    int totalPoints, // sum of top 5
    int totalAttempts, // sum of top 5
    DefaultCompetitorGroup competitorGroup,
    Division division
) {}

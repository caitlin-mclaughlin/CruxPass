package com.cruxpass.dtos;

import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Gender;

import java.util.List;

public record RankedSubmissionDto(
    int placement,
    String name,
    int totalScore,
    List<Integer> routePoints,
    List<Integer> attempts,
    CompetitorGroup competitorGroup,
    Gender division
) {}

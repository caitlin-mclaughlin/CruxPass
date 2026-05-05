package com.cruxpass.models;

import java.util.List;

import com.cruxpass.enums.Division;
import com.cruxpass.models.GroupRefs.GroupRefEmbeddable;

public record RankingInfo(
    int place,
    Long climberId,
    String climberName,
    int totalPoints, // sum of top 5
    int totalAttempts, // sum of top 5
    List<Integer> topPoints,
    List<Integer> topAttempts,
    GroupRefEmbeddable competitorGroup,
    Division division
) {}

package com.cruxpass.dtos;

import java.time.Instant;

import com.cruxpass.dtos.ResolvedCompetitorGroup;
import com.cruxpass.enums.Division;

public record LiveSubmissionEventDto(
    Long competitionId,
    Long climberId,
    String climberName,
    ResolvedCompetitorGroup competitorGroup,
    Division division,
    Long routeId,
    Integer routeNumber,
    Integer routePoints,
    Integer attempts,
    Integer totalPointsAfterUpdate,
    Integer totalAttemptsAfterUpdate,
    Instant timestamp
) {}

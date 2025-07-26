package com.cruxpass.dtos.responses;

public record RouteResponseDto(
    Long id,
    Long competitionId,
    int number,
    int pointValue
) {}

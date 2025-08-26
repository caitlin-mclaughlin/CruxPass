package com.cruxpass.dtos;

public record ClimberScoreDto(
    Long climberId,
    Long compId,
    int score
) {}

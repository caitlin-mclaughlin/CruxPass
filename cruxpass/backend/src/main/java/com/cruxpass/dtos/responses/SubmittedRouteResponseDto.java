package com.cruxpass.dtos.responses;

public record SubmittedRouteResponseDto(
    Long routeId,
    int number,
    int pointValue,
    int attempts,
    boolean send
) {}

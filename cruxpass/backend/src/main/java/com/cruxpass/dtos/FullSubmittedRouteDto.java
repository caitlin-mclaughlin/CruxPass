package com.cruxpass.dtos;

public record FullSubmittedRouteDto(
    Long routeId,
    int number,
    int pointValue,
    int attempts,
    boolean send
) {}

package com.cruxpass.dtos;

public record SubmittedRouteDto(
    Long routeId,
    int attempts,
    boolean send
) {}

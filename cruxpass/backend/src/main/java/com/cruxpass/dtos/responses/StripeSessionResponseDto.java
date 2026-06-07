package com.cruxpass.dtos.responses;

public record StripeSessionResponseDto(
    String sessionId,
    String sessionUrl
) {}

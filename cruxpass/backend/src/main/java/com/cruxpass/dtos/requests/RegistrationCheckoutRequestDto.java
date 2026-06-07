package com.cruxpass.dtos.requests;

public record RegistrationCheckoutRequestDto(
    Long registrationId,
    String successUrl,
    String cancelUrl
) {}

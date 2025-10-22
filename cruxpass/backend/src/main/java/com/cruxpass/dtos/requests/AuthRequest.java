package com.cruxpass.dtos.requests;

import jakarta.validation.constraints.NotBlank;

public record AuthRequest(
    @NotBlank String emailOrUsername,
    @NotBlank String password
) {}

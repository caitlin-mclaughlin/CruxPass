package com.cruxpass.dtos;

import jakarta.validation.constraints.NotBlank;

public class AuthRequest {
    @NotBlank
    public String emailOrUsername;

    @NotBlank
    public String password;
}

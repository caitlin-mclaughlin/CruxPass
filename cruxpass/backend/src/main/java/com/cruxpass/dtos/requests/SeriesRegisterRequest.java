package com.cruxpass.dtos.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class SeriesRegisterRequest {

    @NotBlank
    public String name;

    public String username;

    @Email
    @NotBlank
    public String email;

    @NotBlank
    @Size(min = 6, message = "Password must be at least 6 characters")
    public String password;

    public String description;

    @NotNull
    public LocalDate startDate;

    @NotNull
    public LocalDate endDate;

    @NotNull
    public LocalDateTime deadline;
}

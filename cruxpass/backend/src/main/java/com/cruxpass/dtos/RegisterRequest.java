package com.cruxpass.dtos;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public class RegisterRequest {

    @NotBlank
    public String name;

    // Optional, user email if not set
    public String username;

    @Email
    @NotBlank
    public String email;

    @Pattern(regexp = "^\\+?[0-9\\-\\s]*$", message = "Invalid phone number")
    public String phone;

    // Optional for gym (nullable)
    public LocalDate dob;

    @Size(min = 6, message = "Password must be at least 6 characters")
    public String password;

    @NotNull
    public AddressDto address;
}

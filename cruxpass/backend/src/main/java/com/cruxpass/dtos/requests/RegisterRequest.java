package com.cruxpass.dtos.requests;

import jakarta.validation.constraints.*;
import lombok.NonNull;

import java.time.LocalDate;

import com.cruxpass.dtos.AddressDto;
import com.cruxpass.enums.Gender;


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

    // Null if registering a gym
    public LocalDate dob;

    // Null if registering a gym
    public Gender gender;

    @NotBlank
    @Size(min = 6, message = "Password must be at least 6 characters")
    public String password;

    @NonNull
    public AddressDto address;
}

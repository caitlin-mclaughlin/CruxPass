package com.cruxpass.dtos.requests;

import jakarta.validation.constraints.*;

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

    // Blank if registering a series
    @Pattern(regexp = "^\\+?[0-9\\-\\s]*$", message = "Invalid phone number")
    public String phone;

    // Null if registering a gym or series
    public LocalDate dob;

    // Null if registering a gym or series
    public Gender gender;

    @NotBlank
    @Size(min = 6, message = "Password must be at least 6 characters")
    public String password;

    // Null if registering a series
    public AddressDto address;

    // Blank if not registering a climber
    public String emergencyName;

    // Blank if not registering a climber
    public String emergencyPhone;
}

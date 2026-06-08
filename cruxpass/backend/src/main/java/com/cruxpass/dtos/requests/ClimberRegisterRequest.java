package com.cruxpass.dtos.requests;

import com.cruxpass.dtos.ClimberLocationDto;
import com.cruxpass.enums.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class ClimberRegisterRequest {

    @NotBlank
    public String name;

    public String username;

    @Email
    @NotBlank
    public String email;

    @Pattern(regexp = "^\\+?[0-9\\-\\s]*$", message = "Invalid phone number")
    public String phone;

    @NotNull
    public LocalDate dob;

    @NotNull
    public Gender gender;

    @NotBlank
    @Size(min = 6, message = "Password must be at least 6 characters")
    public String password;

    @NotNull
    public ClimberLocationDto address;

    @NotBlank
    public String emergencyName;

    @NotBlank
    public String emergencyPhone;
}

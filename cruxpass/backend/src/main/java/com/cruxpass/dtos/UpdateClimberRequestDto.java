package com.cruxpass.dtos;

import com.cruxpass.enums.Gender;

import java.time.LocalDate;

public record UpdateClimberRequestDto(
    String name,
    String email,
    String phone,
    String username,
    LocalDate dob,
    Gender gender,
    AddressDto address,
    String emergencyName,
    String emergencyPhone
) {}

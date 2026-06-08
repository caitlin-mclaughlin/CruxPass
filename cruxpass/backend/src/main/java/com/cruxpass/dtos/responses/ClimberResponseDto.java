package com.cruxpass.dtos.responses;

import java.time.LocalDate;

import com.cruxpass.dtos.ClimberLocationDto;
import com.cruxpass.enums.Gender;

public record ClimberResponseDto(
    Long id,
    String name,
    String email,
    String phone,
    String username,
    LocalDate dob,
    Gender gender,
    ClimberLocationDto address,
    LocalDate createdAt,
    String emergencyName,
    String emergencyPhone
) {}

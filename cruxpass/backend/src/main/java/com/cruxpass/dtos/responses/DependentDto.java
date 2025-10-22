package com.cruxpass.dtos.responses;

import java.time.LocalDate;

import com.cruxpass.enums.Gender;

public record DependentDto(
    Long id,
    String name,
    LocalDate dob,
    Gender gender,
    LocalDate createdAt,
    String emergencyName,
    String emergencyPhone
) {}

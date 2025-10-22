package com.cruxpass.dtos.requests;

import java.time.LocalDate;

import com.cruxpass.enums.Gender;

public record CreateDependentDto(
    Long guardianId,
    String name,
    LocalDate dob,
    Gender gender,
    boolean canEnterScores,
    String emergencyName,
    String emergencyPhone
) {}

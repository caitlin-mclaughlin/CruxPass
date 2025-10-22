package com.cruxpass.dtos.responses;

import java.time.LocalDate;

import com.cruxpass.dtos.AddressDto;
import com.cruxpass.enums.Gender;

public record SimpleClimberDto(
    Long id,
    String name,
    String email,
    String phone,
    LocalDate dob,
    Gender gender,
    AddressDto address,
    String emergencyName,
    String emergencyPhone
) {
    public static SimpleClimberDto dependent(Long id, String name, LocalDate dob, Gender gender, String emergencyName, String emergencyPhone) {
        return new SimpleClimberDto(id, name, null, null, dob, gender, null, emergencyName, emergencyPhone);
    }
}

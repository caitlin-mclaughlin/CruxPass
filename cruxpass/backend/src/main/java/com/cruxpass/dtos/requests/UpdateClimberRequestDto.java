package com.cruxpass.dtos.requests;

import com.cruxpass.dtos.AddressDto;
import com.cruxpass.enums.Gender;

import java.time.LocalDate;

public record UpdateClimberRequestDto(
    String name,
    String email,
    String phone,
    String username,
    LocalDate dob,
    Gender gender,
    AddressDto address
) {}

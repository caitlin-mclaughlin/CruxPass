package com.cruxpass.dtos.responses;

import java.time.LocalDate;
import java.util.Date;

import com.cruxpass.dtos.AddressDto;
import com.cruxpass.enums.Gender;

public record ClimberResponseDto(
    Long id,
    String name,
    String email,
    String phone,
    String username,
    LocalDate dob,
    Gender division,
    AddressDto address,
    Date createdAt
) {}

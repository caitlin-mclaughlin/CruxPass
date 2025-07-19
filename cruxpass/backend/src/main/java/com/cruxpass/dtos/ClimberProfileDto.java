package com.cruxpass.dtos;

import java.time.LocalDate;

import com.cruxpass.models.Address;

public record ClimberProfileDto(
    String name,
    String email,
    String phone,
    String username,
    LocalDate dob,
    Address address
) {}

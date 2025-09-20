package com.cruxpass.dtos.responses;

import java.time.LocalDate;

import com.cruxpass.dtos.AddressDto;

public record GymResponseDto(
    Long id,
    String name,
    String email,
    String phone,
    String username,
    AddressDto address,
    LocalDate createdAt
) {}

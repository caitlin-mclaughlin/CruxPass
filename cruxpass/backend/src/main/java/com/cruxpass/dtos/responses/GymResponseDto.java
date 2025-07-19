package com.cruxpass.dtos.responses;

import java.util.Date;

import com.cruxpass.dtos.AddressDto;

public record GymResponseDto(
    Long id,
    String name,
    String email,
    String phone,
    String username,
    AddressDto address,
    Date createdAt
) {}

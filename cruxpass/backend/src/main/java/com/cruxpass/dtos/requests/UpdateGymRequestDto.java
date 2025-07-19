package com.cruxpass.dtos.requests;

import com.cruxpass.dtos.AddressDto;

public record UpdateGymRequestDto(
    String name,
    String email,
    String phone,
    String username,
    AddressDto address
) {}

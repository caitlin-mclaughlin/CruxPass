package com.cruxpass.dtos;

import com.cruxpass.models.Address;

public record UserProfileDto(
    String name,
    String email,
    String phone,
    Address address
) {}

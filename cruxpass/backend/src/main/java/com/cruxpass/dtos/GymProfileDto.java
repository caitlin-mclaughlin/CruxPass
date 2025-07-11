package com.cruxpass.dtos;

import com.cruxpass.models.Address;

public record GymProfileDto(
    String name,
    String email,
    String phone,
    Address address
) {}

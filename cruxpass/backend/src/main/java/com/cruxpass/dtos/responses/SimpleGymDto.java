package com.cruxpass.dtos.responses;

import com.cruxpass.dtos.AddressDto;

public record SimpleGymDto(
    Long id,
    String name,
    String email,
    String phone,
    AddressDto address
) {}
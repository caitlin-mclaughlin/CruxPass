package com.cruxpass.dtos;

public record AddressDto(
    String streetAddress,
    String apartmentNumber,
    String city,
    String state,
    String zipCode
) {}

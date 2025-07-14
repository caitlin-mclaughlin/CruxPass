package com.cruxpass.dtos;

import com.cruxpass.models.Address;

public record AddressDto(
    String streetAddress,
    String apartmentNumber,
    String city,
    String state,
    String zipCode
) {
    public AddressDto(Address addr) {
        this(addr.getStreetAddress(), 
             addr.getApartmentNumber(), 
             addr.getCity(), 
             addr.getState(), 
             addr.getZipCode()
        );
    }
}

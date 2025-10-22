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

    public Address toEntity() {
        Address a = new Address();
        a.setStreetAddress(this.streetAddress);
        a.setApartmentNumber(this.apartmentNumber);
        a.setCity(this.city);
        a.setState(this.state);
        a.setZipCode(this.zipCode);
        return a;
    }

}

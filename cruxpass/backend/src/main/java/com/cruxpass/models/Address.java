package com.cruxpass.models;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Address {

    @NotBlank
    private String streetAdress;
    private String apartmentNumber;
    @NotBlank
    private String city;
    @NotBlank
    private String state;
    @NotBlank
    private String zipCode;
/*    @NotBlank
    private String country;*/

    public Address(String streetAddress, String city, String state, String zipCode/* , String country */) {
        this.streetAdress = streetAddress;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
//        this.country = country;
    }
}

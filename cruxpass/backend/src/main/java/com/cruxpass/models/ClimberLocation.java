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
public class ClimberLocation {

    @NotBlank
    private String city;

    @NotBlank
    private String state;

    private String zipCode;
}

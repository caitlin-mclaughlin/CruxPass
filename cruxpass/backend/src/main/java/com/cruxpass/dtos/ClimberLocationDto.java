package com.cruxpass.dtos;

import com.cruxpass.models.ClimberLocation;

public record ClimberLocationDto(
    String city,
    String state,
    String zipCode
) {
    public ClimberLocationDto(ClimberLocation location) {
        this(
            location == null ? "" : location.getCity(),
            location == null ? "" : location.getState(),
            location == null ? "" : location.getZipCode()
        );
    }

    public ClimberLocation toEntity() {
        return new ClimberLocation(city, state, zipCode);
    }
}

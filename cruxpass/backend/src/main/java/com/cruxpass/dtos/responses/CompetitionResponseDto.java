// CompetitionResponseDto.java
package com.cruxpass.dtos.responses;

import java.time.LocalDateTime;
import java.util.List;

import com.cruxpass.dtos.AddressDto;
import com.cruxpass.dtos.SimpleRegistrationDto;
import com.cruxpass.models.Competition;

public record CompetitionResponseDto(
    Long id,
    Long gymId,
    String name,
    LocalDateTime date,
    List<String> types,
    String format,
    List<String> competitorGroups,
    String status,
    AddressDto location,
    String hostGymName,
    boolean registered,
    SimpleRegistrationDto registration
) {
    public CompetitionResponseDto(Competition comp) {
        this(comp.getId(),
             comp.getGym().getId(),
             comp.getName(),
             comp.getDate(),
             comp.getTypes().stream().map(Enum::name).toList(),
             comp.getFormat().name(),
             comp.getCompetitorGroups().stream().map(Enum::name).toList(),
             comp.getStatus().toString(),
             new AddressDto(comp.getGym().getAddress()),
             comp.getGym().getName(),
             false,
             null
        );
    }
    public CompetitionResponseDto(Competition comp, boolean registered, SimpleRegistrationDto simpleRegistration) {
        this(comp.getId(),
             comp.getGym().getId(),
             comp.getName(),
             comp.getDate(),
             comp.getTypes().stream().map(Enum::name).toList(),
             comp.getFormat().name(),
             comp.getCompetitorGroups().stream().map(Enum::name).toList(),
             comp.getStatus().toString(),
             new AddressDto(comp.getGym().getAddress()),
             comp.getGym().getName(),
             registered,
             simpleRegistration
        );
    }
}

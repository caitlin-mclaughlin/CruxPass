// CompetitionResponseDto.java
package com.cruxpass.dtos;

import java.time.LocalDateTime;
import java.util.List;

import com.cruxpass.models.Competition;

public record CompetitionResponseDto(
    Long id,
    String name,
    LocalDateTime date,
    List<String> types,
    String format,
    List<String> competitorGroups,
    AddressDto location,
    String hostGymName
) {
    public CompetitionResponseDto(Competition comp) {
        this(comp.getId(),
             comp.getName(),
             comp.getDate(),
             comp.getTypes().stream().map(Enum::name).toList(),
             comp.getFormat().name(),
             comp.getCompetitorGroups().stream().map(Enum::name).toList(),
             new AddressDto(comp.getGym().getAddress()),
             comp.getGym().getName()
        );
    }
}

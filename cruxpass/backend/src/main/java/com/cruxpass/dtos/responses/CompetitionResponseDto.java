// CompetitionResponseDto.java
package com.cruxpass.dtos.responses;

import java.time.LocalDateTime;
import java.util.Set;

import com.cruxpass.dtos.AddressDto;
import com.cruxpass.dtos.SimpleRegistrationDto;
import com.cruxpass.enums.CompetitionFormat;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.enums.CompetitionType;
import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Division;
import com.cruxpass.models.Competition;

public record CompetitionResponseDto(
    Long id,
    Long gymId,
    String name,
    LocalDateTime date,
    long duration,
    LocalDateTime deadline,
    int capacity,
    Set<CompetitionType> types,
    CompetitionFormat compFormat,
    Set<CompetitorGroup> competitorGroups,
    Set<Division> divisions,
    boolean divisionsEnabled,
    CompetitionStatus compStatus,
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
             comp.getDuration(),
             comp.getDeadline(),
             comp.getCapacity(),
             comp.getTypes(),
             comp.getCompFormat(),
             comp.getCompetitorGroups(),
             comp.getDivisions(),
             comp.getDivisions() != null || !comp.getDivisions().isEmpty(),
             comp.getCompStatus(),
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
             comp.getDuration(),
             comp.getDeadline(),
             comp.getCapacity(),
             comp.getTypes(),
             comp.getCompFormat(),
             comp.getCompetitorGroups(),
             comp.getDivisions(),
             comp.getDivisions() != null || !comp.getDivisions().isEmpty(),
             comp.getCompStatus(),
             new AddressDto(comp.getGym().getAddress()),
             comp.getGym().getName(),
             registered,
             simpleRegistration
        );
    }
}

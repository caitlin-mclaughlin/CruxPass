// CompetitionResponseDto.java
package com.cruxpass.dtos.responses;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import com.cruxpass.dtos.AddressDto;
import com.cruxpass.dtos.ResolvedCompetitorGroup;
import com.cruxpass.dtos.SimpleRegistrationDto;
import com.cruxpass.enums.CompetitionFormat;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.enums.CompetitionType;
import com.cruxpass.models.Competition;

public record CompetitionResponseDto(
    Long id,
    Long gymId,
    String name,
    LocalDateTime startDate,
    LocalDateTime deadline,
    Set<CompetitionType> types,
    CompetitionFormat compFormat,
    Set<ResolvedCompetitorGroup> selectedGroups,
    List<ResolvedHeatDto> heats,
    CompetitionStatus compStatus,
    String hostGymName,
    AddressDto location,
    Boolean registered,
    SimpleRegistrationDto registration
) {
    public CompetitionResponseDto(
        Competition comp, 
        Set<ResolvedCompetitorGroup> groups, 
        List<ResolvedHeatDto> heats,
        Boolean registered,
        SimpleRegistrationDto reg
    ) {
        this(comp.getId(),
             comp.getGym().getId(),
             comp.getName(),
             comp.getStartDate(),
             comp.getDeadline(),
             comp.getTypes(),
             comp.getCompFormat(),
             groups,
             heats,
             comp.getCompStatus(),
             comp.getGym().getName(),
             new AddressDto(comp.getGym().getAddress()),
             registered,
             reg
        );
    }
}

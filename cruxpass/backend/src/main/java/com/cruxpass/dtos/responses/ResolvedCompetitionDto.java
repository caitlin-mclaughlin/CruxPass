package com.cruxpass.dtos.responses;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import com.cruxpass.dtos.ResolvedCompetitorGroup;
import com.cruxpass.enums.CompetitionFormat;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.enums.CompetitionType;
import com.cruxpass.models.Address;

public record ResolvedCompetitionDto(
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
    Address location
) {}

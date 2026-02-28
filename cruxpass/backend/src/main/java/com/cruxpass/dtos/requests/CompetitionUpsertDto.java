package com.cruxpass.dtos.requests;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import com.cruxpass.enums.CompetitionFormat;
import com.cruxpass.enums.CompetitionType;
import com.cruxpass.models.Address;
import com.cruxpass.models.GroupRefs.GroupRef;

public record CompetitionUpsertDto(
    Long gymId,
    String name,
    LocalDateTime startDate,
    LocalDateTime deadline,
    Set<CompetitionType> types,
    CompetitionFormat compFormat,
    Set<GroupRef> selectedGroups,
    List<HeatUpsertDto> heats,
    String hostGymName,
    Address location
) {}

package com.cruxpass.dtos.responses;

import java.time.LocalDateTime;

import com.cruxpass.enums.CompetitionStatus;

public record SimpleCompetitionDto(
    Long id,
    Long gymId,
    String name,
    LocalDateTime startDate,
    String hostGymName,
    CompetitionStatus compStatus
) {}
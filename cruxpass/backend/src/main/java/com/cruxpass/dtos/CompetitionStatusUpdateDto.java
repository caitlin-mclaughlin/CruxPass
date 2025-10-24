package com.cruxpass.dtos;

import com.cruxpass.enums.CompetitionStatus;

public record CompetitionStatusUpdateDto(
    Long competitionId, 
    CompetitionStatus status
) {}

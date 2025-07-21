package com.cruxpass.dtos.requests;

import java.time.LocalDateTime;
import java.util.Set;

import com.cruxpass.enums.CompetitionFormat;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.enums.CompetitionType;
import com.cruxpass.enums.CompetitorGroup;

public record UpdateCompRequestDto(
    String name,
    LocalDateTime date,
    Set<CompetitionType> types,
    CompetitionFormat format,
    Set<CompetitorGroup> competitorGroups,
    CompetitionStatus status
) {} 

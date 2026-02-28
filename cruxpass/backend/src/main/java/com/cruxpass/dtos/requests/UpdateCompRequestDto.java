package com.cruxpass.dtos.requests;

import java.time.LocalDateTime;
import java.util.Set;

import com.cruxpass.enums.CompetitionFormat;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.enums.CompetitionType;
import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.Division;
import com.fasterxml.jackson.annotation.JsonFormat;

public record UpdateCompRequestDto(
    String name,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime startDate,
    long duration,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime deadline,
    int capacity,
    Set<CompetitionType> types,
    CompetitionFormat compFormat,
    Set<DefaultCompetitorGroup> competitorGroups,
    Set<Division> divisions,
    CompetitionStatus compStatus
) {} 

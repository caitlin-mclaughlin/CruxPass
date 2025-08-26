package com.cruxpass.dtos.requests;

import java.time.LocalDateTime;
import java.util.Set;

import com.cruxpass.enums.CompetitionFormat;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.enums.CompetitionType;
import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Gender;
import com.fasterxml.jackson.annotation.JsonFormat;

public record UpdateCompRequestDto(
    String name,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime date,
    long duration,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime deadline,
    int capacity,
    Set<CompetitionType> types,
    CompetitionFormat compFormat,
    Set<CompetitorGroup> competitorGroups,
    Set<Gender> divisions,
    CompetitionStatus compStatus
) {} 

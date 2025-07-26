package com.cruxpass.dtos;

import java.time.LocalDateTime;
import java.util.Set;

import com.cruxpass.enums.CompetitionFormat;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.enums.CompetitionType;
import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Gender;

public record CompetitionDto (
    String name,
    LocalDateTime date,
    LocalDateTime deadline,
    int capacity,
    Set<CompetitionType> types,
    CompetitionFormat format,
    Set<CompetitorGroup> competitorGroups,
    Set<Gender> divisions,
    CompetitionStatus status,
    AddressDto location
) {}

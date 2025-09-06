package com.cruxpass.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.cruxpass.enums.CompetitionStatus;

public record SeriesDto(
    String name,
    String email,
    String description,
    LocalDate startDate,
    LocalDate endDate,
    LocalDateTime deadline,
    CompetitionStatus seriesStatus,
    List<Long> competitionIds
) {}

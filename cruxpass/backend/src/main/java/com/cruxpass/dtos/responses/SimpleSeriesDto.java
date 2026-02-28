package com.cruxpass.dtos.responses;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.cruxpass.enums.CompetitionStatus;

public record SimpleSeriesDto(
    Long id,
    String name,
    String email,
    LocalDate startDate,
    LocalDate endDate,
    LocalDateTime deadline,
    CompetitionStatus seriesStatus
) {}
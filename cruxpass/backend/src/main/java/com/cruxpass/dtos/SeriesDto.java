package com.cruxpass.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;
import com.cruxpass.enums.CompetitionStatus;

public record SeriesDto(
    Long id,
    String name,
    String email,
    String username,
    String description, // optional, null means "clear", omitted means "no change"
    LocalDate startDate,
    LocalDate endDate,
    LocalDateTime deadline,
    CompetitionStatus seriesStatus,
    LocalDate createdAt
) {}

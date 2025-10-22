package com.cruxpass.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.cruxpass.enums.CompetitionStatus;

public record PublicSeriesDto(
    Long id,
    String name,
    String email,
    String description, // optional, null means "clear", omitted means "no change"
    LocalDate startDate,
    LocalDate endDate,
    LocalDateTime deadline,
    CompetitionStatus seriesStatus, 
    boolean registered,
    SeriesRegistrationDto registration
) {
    /*public PublicSeriesDto(Series series) {
        this(series.getId(),
             series.getName(),
             series.getEmail(),
             series.getDescription(),
             series.getStartDate(),
             series.getEndDate(),
             series.getDeadline(),
             series.getSeriesStatus(),
             false,
             null

        );
    }

    public PublicSeriesDto(Series series, boolean registered, SimpleRegistrationDto simpleRegistration) {
        this(series.getId(),
             series.getName(),
             series.getEmail(),
             series.getDescription(),
             series.getStartDate(),
             series.getEndDate(),
             series.getDeadline(),
             series.getSeriesStatus(),
             registered,
             null
        );
    }*/
}

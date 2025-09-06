package com.cruxpass.mappers;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import com.cruxpass.dtos.SeriesDto;
import com.cruxpass.dtos.requests.UpdateGymRequestDto;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Series;

public class SeriesMapper {

    public SeriesDto toDto(Series series) {
        return new SeriesDto(
            series.getName(),
            series.getEmail(),
            series.getDescription(),
            series.getStartDate(),
            series.getEndDate(),
            series.getDeadline(),
            calculateStatus(series),
            series.getCompetitions()
                .stream()
                .map(Competition::getId)
                .toList()
        );
    }

    public Series toEntity(SeriesDto dto, List<Competition> competitions) {
        Series series = new Series();
        series.setName(dto.name());
        series.setEmail(dto.email());
        series.setDescription(dto.description());
        series.setStartDate(dto.startDate());
        series.setEndDate(dto.endDate());
        series.setDeadline(dto.deadline());
        // derive status once entity is populated
        series.setSeriesStatus(calculateStatus(series));

        return series;
    }

    public void updateSeriesFromDto(SeriesDto dto, Series series) {
        series.setName(dto.name());
        series.setEmail(dto.email());
        series.setDescription(dto.description());
        series.setStartDate(dto.startDate());
        series.setStartDate(dto.startDate());
        series.setDeadline(dto.deadline());
        series.setSeriesStatus(calculateStatus(series));
    }
    
    private CompetitionStatus calculateStatus(Series series) {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("America/Denver"));

        if (now.isBefore(series.getStartDate().atStartOfDay())) {
            return CompetitionStatus.UPCOMING;
        } else if (now.isAfter(series.getEndDate().atTime(23, 59, 59))) {
            return CompetitionStatus.FINISHED;
        } else {
            return CompetitionStatus.LIVE;
        }
    }

}


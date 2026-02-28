package com.cruxpass.mappers;

import java.time.LocalDateTime;
import java.time.ZoneId;

import com.cruxpass.dtos.PublicSeriesDto;
import com.cruxpass.dtos.SeriesDto;
import com.cruxpass.dtos.SeriesRegistrationDto;
import com.cruxpass.dtos.responses.SimpleSeriesDto;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.models.Series;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class SeriesMapper {

    public SeriesDto toDto(Series series) {
        if (series == null) return null;
        return new SeriesDto(
            series.getId(),
            series.getName(),
            series.getEmail(),
            series.getUsername(),
            series.getDescription(),
            series.getStartDate(),
            series.getEndDate(),
            series.getDeadline(),
            calculateStatus(series),
            series.getCreatedAt()
        );
    }

    public SimpleSeriesDto toSimpleDto(Series series) {
        if (series == null) return null;
        return new SimpleSeriesDto(
            series.getId(),
            series.getName(),
            series.getEmail(),
            series.getStartDate(),
            series.getEndDate(),
            series.getDeadline(),
            calculateStatus(series)
        );
    }

    public PublicSeriesDto toPublicDto(Series series, boolean registered, SeriesRegistrationDto dto) {
        if (series == null) return null;
        return new PublicSeriesDto(
            series.getId(),
            series.getName(),
            series.getEmail(),
            series.getDescription(),
            series.getStartDate(),
            series.getEndDate(),
            series.getDeadline(),
            calculateStatus(series),
            registered,
            dto
        );
    }

    public Series toEntity(SeriesDto dto) {
        if (dto == null) return null;
        Series series = new Series();
        updateSeriesFromDto(dto, series);
        return series;
    }

    public void updateSeriesFromDto(SeriesDto dto, Series series) {
        if (dto == null || series == null) return;
        if (dto.id() != null) series.setId(dto.id());
        if (StringUtils.hasText(dto.name())) series.setName(dto.name());
        if (StringUtils.hasText(dto.email())) series.setEmail(dto.email());
        if (StringUtils.hasText(dto.username())) series.setUsername(dto.username());
        if (dto.description() != null) series.setDescription(dto.description());
        if (dto.startDate() != null) series.setStartDate(dto.startDate());
        if (dto.endDate() != null) series.setEndDate(dto.endDate());
        if (dto.deadline() != null) series.setDeadline(dto.deadline());
        if (dto.createdAt() != null) series.setCreatedAt(dto.createdAt());

        // derive status once entity is populated
        series.setSeriesStatus(calculateStatus(series));
    }
    
    private CompetitionStatus calculateStatus(Series series) {
        if (series == null || series.getStartDate() == null) return null;
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


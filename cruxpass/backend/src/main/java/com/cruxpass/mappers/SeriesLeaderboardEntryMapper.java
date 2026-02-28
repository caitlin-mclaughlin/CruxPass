package com.cruxpass.mappers;

import java.util.ArrayList;

import com.cruxpass.dtos.SeriesLeaderboardEntryDto;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Series;
import com.cruxpass.models.SeriesLeaderboardEntry;

import org.springframework.stereotype.Component;

@Component
public class SeriesLeaderboardEntryMapper {

    public SeriesLeaderboardEntryDto toDto(SeriesLeaderboardEntry entry) {
        if (entry == null) return null;
        return new SeriesLeaderboardEntryDto(
            entry.getClimber().getId(),
            entry.getCompetitorGroup(),
            entry.getDivision(),
            entry.getClimber().getName(),
            entry.getTotalSeriesPoints(),
            entry.getRawClimbingPoints(),
            entry.getTotalAttempts(),
            entry.getRank(),
            new ArrayList<>(entry.getPlacementCounts()), // defensive copy
            new ArrayList<>(entry.getResults())          // defensive copy
        );
    }

    public SeriesLeaderboardEntry toEntity(SeriesLeaderboardEntryDto dto, Series series, Climber climber) {
        if (dto == null || series == null || climber == null) return null;
        SeriesLeaderboardEntry entry = new SeriesLeaderboardEntry();
        entry.setSeries(series);
        entry.setClimber(climber);
        entry.setCompetitorGroup(dto.group());
        entry.setDivision(dto.division());
        entry.setTotalSeriesPoints(dto.totalSeriesPoints());
        entry.setRawClimbingPoints(dto.rawClimbingPoints());
        entry.setTotalAttempts(dto.totalAttempts());
        entry.setRank(dto.rank());
        entry.setPlacementCounts(new ArrayList<>(dto.placementCounts()));
        entry.setResults(new ArrayList<>(dto.results()));
        return entry;
    }
}


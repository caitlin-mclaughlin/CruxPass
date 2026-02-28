package com.cruxpass.controllers;

import com.cruxpass.annotations.CurrentSeries;
import com.cruxpass.dtos.SeriesDto;
import com.cruxpass.dtos.SeriesLeaderboardEntryDto;
import com.cruxpass.dtos.responses.SimpleCompetitionDto;
import com.cruxpass.dtos.responses.SimpleGymDto;
import com.cruxpass.dtos.responses.SimpleSeriesDto;
import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.Division;
import com.cruxpass.mappers.CompetitionMapper;
import com.cruxpass.mappers.GymMapper;
import com.cruxpass.mappers.SeriesMapper;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Series;
import com.cruxpass.services.CompetitionService;
import com.cruxpass.services.GymService;
import com.cruxpass.services.SeriesService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/series")
public class SeriesController {

    private final SeriesService seriesService;
    private final CompetitionService compService;
    private final GymService gymService;

    @Autowired private SeriesMapper seriesMap;
    @Autowired private GymMapper gymMap;
    @Autowired private CompetitionMapper compMap;
    
    @GetMapping("/search")
    public ResponseEntity<List<SimpleSeriesDto>> searchSeries(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String name
    ) {
        List<Series> results = seriesService.searchSeries(email, name);
        if (results == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        return ResponseEntity.ok(results.stream()
            .map(seriesMap::toSimpleDto)
            .toList());
    }

    // Secure endpoint for logged-in series
    @GetMapping("/me")
    public ResponseEntity<SeriesDto> getCurrentSeries(
        @CurrentSeries Series series
    ) {
        return ResponseEntity.ok(seriesMap.toDto(series));
    }

    @PutMapping("/me")
    public ResponseEntity<SeriesDto> updateSeries(
        @CurrentSeries Series series,
        @RequestBody SeriesDto updateRequest
    ) {
        seriesMap.updateSeriesFromDto(updateRequest, series);

        return ResponseEntity.ok(seriesMap.toDto(seriesService.save(series)));
    }

    @GetMapping("/me/gyms")
    public ResponseEntity<List<SimpleGymDto>> getGyms(
        @CurrentSeries Series series
    ) {
        List<SimpleGymDto> gyms = series.getGyms().stream().map(gymMap::toSimpleDto).toList();

        return ResponseEntity.ok(gyms);
    }

    @GetMapping("/me/competitions")
    public ResponseEntity<List<SimpleCompetitionDto>> getCompetitions(
        @CurrentSeries Series series
    ) {
        List<SimpleCompetitionDto> comps = series.getCompetitions().stream().map(compMap::toSimpleDto).toList();

        return ResponseEntity.ok(comps);
    }

    @PutMapping("/me/gyms/{gymId}")
    public ResponseEntity<Void> linkGym(
        @PathVariable Long gymId,
        @CurrentSeries Series series
    ) {
        Gym gym = gymService.getByIdWithSeries(gymId);
        if (gym == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        
        seriesService.linkGym(series, gym);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/me/competitions/{competitionId}")
    public ResponseEntity<Void> linkCopmetition(
        @PathVariable Long competitionId,
        @CurrentSeries Series series
    ) {
        Competition comp = compService.getById(competitionId);
        if (comp == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        
        seriesService.linkCompetition(series, comp);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me/gyms/{gymId}")
    public ResponseEntity<Void> unlinkGym(
        @PathVariable Long gymId,
        @CurrentSeries Series series
    ) {
        Gym gym = gymService.getById(gymId);
        if (gym == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        seriesService.unlinkGym(series, gym);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me/competitions/{competitionId}")
    public ResponseEntity<Void> unlinkCompetition(
        @PathVariable Long competitionId,
        @CurrentSeries Series series
    ) {
        Competition comp = compService.getById(competitionId);
        if (comp == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        seriesService.unlinkCompetition(series, comp);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{seriesId}/leaderboard")
    public List<SeriesLeaderboardEntryDto> getSeriesLeaderboard(
            @PathVariable Long seriesId,
            @RequestParam DefaultCompetitorGroup group,
            @RequestParam(required = false) Division division
    ) {
        return seriesService.getLeaderboard(seriesId, group, division);
    }

}

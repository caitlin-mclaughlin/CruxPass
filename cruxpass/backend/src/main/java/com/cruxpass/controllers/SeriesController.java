package com.cruxpass.controllers;

import com.cruxpass.dtos.SeriesDto;
import com.cruxpass.dtos.SeriesLeaderboardEntryDto;
import com.cruxpass.dtos.requests.UpdateGymRequestDto;
import com.cruxpass.dtos.responses.GymResponseDto;
import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Gender;
import com.cruxpass.mappers.SeriesMapper;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Series;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.SeriesService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/series")
public class SeriesController {

    private final SeriesService seriesService;
    private final CurrentUserService currentUserService;

    @Autowired
    private SeriesMapper seriesMap;

    public SeriesController(
        SeriesService seriesService,
        CurrentUserService currentUserService
    ) {
        this.seriesService = seriesService;
        this.currentUserService = currentUserService;
    }

    // Secure endpoint for logged-in climber
    @GetMapping("/me")
    public ResponseEntity<SeriesDto> getCurrentSeries(
        @RequestHeader("Authorization") String authHeader
    ) {
        Series series = currentUserService.getSeriesFromToken(authHeader);
        if (series == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(seriesMap.toDto(series));
    }

    @PutMapping("/me")
    public ResponseEntity<SeriesDto> updateSeries(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody SeriesDto updateRequest
    ) {
        Series series = currentUserService.getSeriesFromToken(authHeader);
        if (series == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // Or 401
        }

        seriesMap.updateSeriesFromDto(updateRequest, series);

        return ResponseEntity.ok(seriesMap.toDto(seriesService.save(series)));
    }

    @GetMapping("/{seriesId}/leaderboard")
    public List<SeriesLeaderboardEntryDto> getSeriesLeaderboard(
            @PathVariable Long seriesId,
            @RequestParam CompetitorGroup group,
            @RequestParam(required = false) Gender division
    ) {
        return seriesService.getLeaderboard(seriesId, group, division);
    }
}

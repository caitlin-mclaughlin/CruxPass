package com.cruxpass.controllers;

import com.cruxpass.dtos.PublicSeriesDto;
import com.cruxpass.dtos.SeriesRegistrationDto;
import com.cruxpass.mappers.SeriesMapper;
import com.cruxpass.mappers.SeriesRegistrationMapper;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Series;
import com.cruxpass.models.SeriesRegistration;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.SeriesRegistrationService;
import com.cruxpass.services.SeriesService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/publicSeries")
public class PublicSeriesController {

    private final SeriesService seriesService;
    private final SeriesRegistrationService seriesRegService;
    private final CurrentUserService currentUserService;

    @Autowired
    private SeriesMapper seriesMap;
    @Autowired
    private SeriesRegistrationMapper seriesRegMap;

    public PublicSeriesController(
        SeriesService seriesService,
        SeriesRegistrationService seriesRegService,
        CurrentUserService currentUserService
    ) {
        this.seriesService = seriesService;
        this.seriesRegService = seriesRegService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public ResponseEntity<List<PublicSeriesDto>> getAllSeries(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        final Climber climber = (authHeader != null && !authHeader.isBlank())
            ? currentUserService.getClimberFromToken(authHeader)
            : null;

        List<Series> series = seriesService.getAll();
        if (series == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(series.stream()
            .map(s ->  {
                SeriesRegistration reg = climber != null
                    ? seriesRegService.getByClimberAndSeries(climber, s)
                    : null;
                SeriesRegistrationDto dto = reg != null
                    ? seriesRegMap.toDto(reg)
                    : null;

                return seriesMap.toPublicDto(s, reg != null, dto);
            })
            .toList());
    }
}


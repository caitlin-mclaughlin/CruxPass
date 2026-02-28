package com.cruxpass.controllers;

import com.cruxpass.annotations.CurrentGym;
import com.cruxpass.dtos.requests.UpdateGymRequestDto;
import com.cruxpass.dtos.responses.GymResponseDto;
import com.cruxpass.dtos.responses.SimpleGymDto;
import com.cruxpass.dtos.responses.SimpleSeriesDto;
import com.cruxpass.mappers.GymMapper;
import com.cruxpass.mappers.SeriesMapper;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Series;
import com.cruxpass.services.GymService;
import com.cruxpass.services.SeriesService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/gyms")
public class GymController {

    private final GymService gymService;
    private final SeriesService seriesService;

    @Autowired private GymMapper gymMap;
    @Autowired private SeriesMapper seriesMap;

    @GetMapping("/search")
    public ResponseEntity<List<SimpleGymDto>> searchGyms(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone
    ) {
        List<Gym> results = gymService.searchGyms(email, name, phone);
        if (results == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        return ResponseEntity.ok(results.stream()
            .map(gymMap::toSimpleDto)
            .toList());
    }

    @GetMapping
    public ResponseEntity<List<GymResponseDto>> getAll() {
        List<Gym> gyms = gymService.getAll();
        if (gyms == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(gyms.stream()
            .map(gym -> gymMap.toResponseDto(gym))
            .toList());
    }

    // Secure endpoint for logged-in gym
    @GetMapping("/me")
    public ResponseEntity<GymResponseDto> getCurrentGym(
        @CurrentGym Gym gym
    ) {
        return ResponseEntity.ok(gymMap.toResponseDto(gym));
    }

    @PutMapping("/me")
    public ResponseEntity<GymResponseDto> updateGym(
        @CurrentGym Gym gym,
        @RequestBody UpdateGymRequestDto updateRequest
    ) {
        gymMap.updateGymFromDto(updateRequest, gym);

        return ResponseEntity.ok(gymMap.toResponseDto(gymService.save(gym)));
    }

    @GetMapping("/me/series")
    public ResponseEntity<List<SimpleSeriesDto>> getSeries(
        @CurrentGym Gym gym
    ) {
        List<SimpleSeriesDto> series = seriesService.getByGymId(gym.getId()).stream().map(seriesMap::toSimpleDto).toList();

        return ResponseEntity.ok(series);
    }

    @PutMapping("/me/series/{seriesId}")
    public ResponseEntity<Void> linkSeries(
        @PathVariable Long seriesId,
        @CurrentGym Gym gym
    ) {
        Series series = seriesService.getByIdWithGyms(seriesId);
        if (series == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        
        seriesService.linkGym(series, gym);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me/series/{seriesId}")
    public ResponseEntity<Void> unlinkSeries(
        @PathVariable Long seriesId,
        @CurrentGym Gym gym
    ) {
        Series series = seriesService.getById(seriesId);
        if (series == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        seriesService.unlinkGym(series, gym);
        return ResponseEntity.noContent().build();
    }

}
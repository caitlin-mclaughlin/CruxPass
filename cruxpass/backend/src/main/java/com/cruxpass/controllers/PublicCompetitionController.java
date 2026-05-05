package com.cruxpass.controllers;

import com.cruxpass.dtos.responses.ResolvedCompetitionDto;
import com.cruxpass.services.CompetitionService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/competitions")
public class PublicCompetitionController {

    private final CompetitionService competitionService;

    @GetMapping
    public ResponseEntity<List<ResolvedCompetitionDto>> getAllCompetitions() {
        return ResponseEntity.ok(competitionService.getAllDtos());
    }

    @GetMapping("/{compId}")
    public ResponseEntity<ResolvedCompetitionDto> getById(
        @PathVariable Long compId,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        return ResponseEntity.ok(competitionService.getDtoById(compId));
    }
}

package com.cruxpass.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cruxpass.annotations.CurrentSeries;
import com.cruxpass.dtos.CompetitorGroupDto;
import com.cruxpass.dtos.CreatedGroupResult;
import com.cruxpass.dtos.ResolvedCompetitorGroup;
import com.cruxpass.dtos.requests.CreateCompetitorGroupDto;
import com.cruxpass.dtos.requests.GroupMutationsDto;
import com.cruxpass.enums.OwnerType;
import com.cruxpass.models.Series;
import com.cruxpass.services.CompetitorGroupService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/series/me/competitor-groups")
@RequiredArgsConstructor
public class SeriesCompetitorGroupController {

    private final CompetitorGroupService groupService;

    @GetMapping
    public ResponseEntity<List<ResolvedCompetitorGroup>> getCompetitorGroups(@CurrentSeries Series series) {
        return ResponseEntity.ok(groupService.getActiveGroups(OwnerType.SERIES, series.getId()));
    }

    @PostMapping
    public ResponseEntity<ResolvedCompetitorGroup> createCompetitorGroup(
        @CurrentSeries Series series,
        @RequestBody @Valid CreateCompetitorGroupDto dto
    ) {
        return ResponseEntity.ok(groupService.createGroup(OwnerType.SERIES, series.getId(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResolvedCompetitorGroup> updateCompetitorGroup(
        @PathVariable Long id,
        @CurrentSeries Series series,
        @RequestBody @Valid CompetitorGroupDto dto
    ) {
        return ResponseEntity.ok(groupService.updateGroup(OwnerType.SERIES, series.getId(), id, dto));
    }

    @DeleteMapping("/{groupId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGroup(
        @PathVariable Long groupId,
        @CurrentSeries Series series
    ) {
        groupService.deleteGroup(OwnerType.SERIES, series.getId(), groupId);
    }

    @PostMapping("/mutations")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<List<CreatedGroupResult>> applyGroupMutations(
        @CurrentSeries Series series,
        @RequestBody GroupMutationsDto dto
    ) {
        List<CreatedGroupResult> createdResults = groupService.applyGroupMutations(OwnerType.SERIES, series.getId(), dto);
        return ResponseEntity.ok(createdResults);
    }
}


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

import com.cruxpass.annotations.CurrentGym;
import com.cruxpass.dtos.CompetitorGroupDto;
import com.cruxpass.dtos.CreatedGroupResult;
import com.cruxpass.dtos.ResolvedCompetitorGroup;
import com.cruxpass.dtos.requests.CreateCompetitorGroupDto;
import com.cruxpass.dtos.requests.GroupMutationsDto;
import com.cruxpass.enums.OwnerType;
import com.cruxpass.models.Gym;
import com.cruxpass.services.CompetitorGroupService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/gyms/me/competitor-groups")
@RequiredArgsConstructor
public class GymCompetitorGroupController {

    private final CompetitorGroupService groupService;

    @GetMapping
    public ResponseEntity<List<ResolvedCompetitorGroup>> getCompetitorGroups(@CurrentGym Gym gym) {
        return ResponseEntity.ok(groupService.getActiveGroups(OwnerType.GYM, gym.getId()));
    }

    @PostMapping
    public ResponseEntity<ResolvedCompetitorGroup> createCompetitorGroup(
        @CurrentGym Gym gym,
        @RequestBody @Valid CreateCompetitorGroupDto dto
    ) {
        return ResponseEntity.ok(groupService.createGroup(OwnerType.GYM, gym.getId(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResolvedCompetitorGroup> updateCompetitorGroup(
        @PathVariable Long id,
        @CurrentGym Gym gym,
        @RequestBody @Valid CompetitorGroupDto dto
    ) {
        return ResponseEntity.ok(groupService.updateGroup(OwnerType.GYM, gym.getId(), id, dto));
    }

    @DeleteMapping("/{groupId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGroup(
        @PathVariable Long groupId,
        @CurrentGym Gym gym
    ) {
        groupService.deleteGroup(OwnerType.GYM, gym.getId(), groupId);
    }

    @PostMapping("/mutations")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<List<CreatedGroupResult>> applyGroupMutations(
        @CurrentGym Gym gym,
        @RequestBody GroupMutationsDto dto
    ) {
        List<CreatedGroupResult> createdResults = groupService.applyGroupMutations(OwnerType.GYM, gym.getId(), dto);
        return ResponseEntity.ok(createdResults);
    }
    
}

package com.cruxpass.controllers;

import com.cruxpass.annotations.CurrentClimber;
import com.cruxpass.dtos.UpdateClimberRequestDto;
import com.cruxpass.dtos.requests.CreateDependentDto;
import com.cruxpass.dtos.responses.DependentDto;
import com.cruxpass.dtos.responses.SimpleClimberDto;
import com.cruxpass.dtos.responses.ClimberResponseDto;
import com.cruxpass.mappers.ClimberMapper;
import com.cruxpass.models.Climber;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.ClimberService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/climbers")
public class ClimberController {

    private final ClimberService climberService;
    private final CurrentUserService currentUserService;
    
    @Autowired
    private ClimberMapper climberMap;

    public ClimberController(ClimberService climberService, CurrentUserService currentUserService) {
        this.climberService = climberService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<SimpleClimberDto>> searchClimbers(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone
    ) {
        List<Climber> results = climberService.searchClimbers(email, name, phone);
        if (results == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        return ResponseEntity.ok(results.stream()
            .map(climberMap::toSimpleDto)
            .toList());
    }

    @GetMapping("/{id}/dependents")
    public ResponseEntity<List<SimpleClimberDto>> getDependents(
        @PathVariable Long id
    ) {
        Climber guardian = climberService.getById(id);
        if (guardian == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        List<Climber> dependents = climberService.getDependentsOfGuardian(guardian.getId());
        return ResponseEntity.ok(dependents.stream()
            .map(climberMap::toSimpleDependentDto)
            .toList());
    }

    // Secure endpoint for logged-in climber
    @GetMapping("/me")
    public ResponseEntity<ClimberResponseDto> getCurrentClimber(
        @CurrentClimber Climber climber
    ) {
        return ResponseEntity.ok(climberMap.toDto(climber));
    }

    @PutMapping("/me")
    public ResponseEntity<ClimberResponseDto> updateClimber(
        @CurrentClimber Climber climber,
        @RequestBody UpdateClimberRequestDto updateRequest
    ) {
        climberMap.updateEntityFromDto(updateRequest, climber);

        return ResponseEntity.ok(climberMap.toDto(climberService.save(climber)));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deactivateSelf(
        @CurrentClimber Climber climber
    ) {
        climberService.deactivateClimber(climber.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/me/dependents")
    public ResponseEntity<DependentDto> createDependent(
        @CurrentClimber Climber guardian,
        @RequestBody CreateDependentDto dependentDto
    ) {
        Climber dependent = climberService.createDependent(guardian.getId(), dependentDto);
        return ResponseEntity.ok(climberMap.toDependentDto(dependent));
    }

    @GetMapping("/me/dependents")
    public ResponseEntity<List<DependentDto>> getMyDependents(
        @CurrentClimber Climber guardian
    ) {
        List<Climber> dependents = climberService.getDependentsOfGuardian(guardian.getId());
        return ResponseEntity.ok(dependents.stream()
            .map(climberMap::toDependentDto)
            .toList());
    }

    @PutMapping("/me/dependents/{dependentId}")
    public ResponseEntity<DependentDto> updateDependent(
        @PathVariable Long dependentId,
        @CurrentClimber Climber guardian,
        @RequestBody UpdateClimberRequestDto updateRequest
    ) {
        Climber updated = climberService.updateDependent(guardian.getId(), dependentId, updateRequest);
        if (updated == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        return ResponseEntity.ok(climberMap.toDependentDto(updated));
    }

    @DeleteMapping("/me/dependents/{dependentId}")
    public ResponseEntity<Void> deleteDependent(
        @PathVariable Long dependentId,
        @CurrentClimber Climber guardian
    ) {
        boolean deleted = climberService.deleteDependent(guardian.getId(), dependentId);
        if (!deleted)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/me/dependents/{dependentId}/guardians/{guardianId}")
    public ResponseEntity<DependentDto> addGuardian(
        @PathVariable Long dependentId,
        @PathVariable Long guardianId,
        @CurrentClimber Climber requester
    ) {
        Climber dependent = climberService.addGuardianToDependent(requester.getId(), dependentId, guardianId);
        if (dependent == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        return ResponseEntity.ok(climberMap.toDependentDto(dependent));
    }

    @DeleteMapping("/me/dependents/{dependentId}/guardians/{guardianId}")
    public ResponseEntity<DependentDto> removeGuardian(
        @PathVariable Long dependentId,
        @PathVariable Long guardianId,
        @CurrentClimber Climber requester
    ) {
        Climber dependent = climberService.removeGuardianFromDependent(requester.getId(), dependentId, guardianId);
        if (dependent == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        return ResponseEntity.ok(climberMap.toDependentDto(dependent));
    }

}

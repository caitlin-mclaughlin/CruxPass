package com.cruxpass.mappers;

import java.util.List;

import com.cruxpass.dtos.SimpleRegistrationDto;
import com.cruxpass.dtos.requests.CompRegistrationRequestDto;
import com.cruxpass.dtos.responses.RegistrationResponseDto;
import com.cruxpass.dtos.responses.SimpleRegistrationResponseDto;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Registration;

import org.springframework.stereotype.Component;

@Component
public class RegistrationMapper {

    // Convert from Registration entity to RegistrationResponseDto
    public RegistrationResponseDto toResponseDto(Registration reg) {
        if (reg == null) return null;
        return new RegistrationResponseDto(
            reg.getId(),
            reg.getCompetition().getGym().getId(),
            reg.getCompetition().getId(),
            reg.getClimber().getName(),
            reg.getClimber().getDob(),
            reg.getClimber().getEmail(),
            reg.getCompetitorGroup(),
            reg.getDivision(),
            reg.isPaid()
        );
    }

    // Convert from Registration entity to SimpleRegistrationDto
    public SimpleRegistrationDto toSimpleDto(Registration reg) {
        if (reg == null) return null;
        return new SimpleRegistrationDto(
            reg.getDivision(),
            reg.getCompetitorGroup()
        );
    }

    /** Convert Registration entity to SimpleRegistrationResponseDto */
    public SimpleRegistrationResponseDto toSimpleResponseDto(Registration reg) {
        if (reg == null) return null;
        return new SimpleRegistrationResponseDto(
            reg.getId(),
            reg.getCompetition().getId(),
            reg.getClimber().getName(),
            reg.getClimber().getDob(),
            reg.getClimber().getEmail(),
            reg.getCompetitorGroup(),
            reg.getDivision()
        );
    }

    // Convert from CompRegistrationRequestDto to Registration entity
    public Registration toEntity(CompRegistrationRequestDto dto, Climber climber, Competition comp) {
        if (dto == null || climber == null || comp == null) return null;
        Registration reg = new Registration();
        reg.setClimber(climber);
        reg.setCompetition(comp);
        reg.setCompetitorGroup(dto.competitorGroup());
        reg.setDivision(dto.division());
        reg.setPaid(dto.paid());
        return reg;
    }

    // Optionally, map a list of registrations to response DTOs
    public List<RegistrationResponseDto> toResponseDtoList(List<Registration> registrations) {
        return registrations.stream()
            .map(this::toResponseDto)
            .toList();
    }

    public List<SimpleRegistrationDto> toSimpleDtoList(List<Registration> registrations) {
        return registrations.stream()
            .map(this::toSimpleDto)
            .toList();
    }
}


package com.cruxpass.mappers;

import org.springframework.stereotype.Component;

import com.cruxpass.dtos.SimpleRegistrationDto;
import com.cruxpass.dtos.requests.UpdateCompRequestDto;
import com.cruxpass.dtos.responses.CompetitionResponseDto;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.enums.Gender;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Set;

@Component
public class CompetitionMapper {

    public CompetitionResponseDto toResponseDto(Competition comp) {
        comp.setCompStatus(calculateStatus(comp));
        return new CompetitionResponseDto(comp);
    }

    public CompetitionResponseDto toResponseDto(Competition comp, boolean registered, SimpleRegistrationDto simpleRegistration) {
        comp.setCompStatus(calculateStatus(comp));
        return new CompetitionResponseDto(comp, registered, simpleRegistration);
    }

    public void updateCompetitionFromDto(UpdateCompRequestDto dto, Competition comp) {
        comp.setName(dto.name());
        comp.setDate(dto.date());
        comp.setDuration(dto.duration());
        comp.setDeadline(dto.deadline());
        comp.setCapacity(dto.capacity());
        comp.setTypes(dto.types());
        comp.setCompFormat(dto.compFormat());
        comp.setCompetitorGroups(dto.competitorGroups());

        // divisionsEnabled logic
        Set<Gender> divisions = dto.divisions();
        boolean divisionsEnabled = divisions != null && !divisions.isEmpty();
        comp.setDivisions(divisionsEnabled ? divisions : null);

        comp.setCompStatus(calculateStatus(comp));
    }

    public Competition toEntity(UpdateCompRequestDto dto, Gym gym) {
        Competition comp = new Competition();
        comp.setName(dto.name());
        comp.setDate(dto.date());
        comp.setDuration(dto.duration());
        comp.setDeadline(dto.deadline());
        comp.setCapacity(dto.capacity());
        comp.setCompFormat(dto.compFormat());
        comp.setTypes(dto.types());
        comp.setCompetitorGroups(dto.competitorGroups());

        Set<Gender> divisions = dto.divisions();
        boolean divisionsEnabled = divisions != null && !divisions.isEmpty();
        comp.setDivisions(divisionsEnabled ? divisions : null);

        comp.setCompStatus(calculateStatus(comp));
        comp.setGym(gym);

        return comp;
    }

    private CompetitionStatus calculateStatus(Competition competition) {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("America/Denver"));

        if (now.isBefore(competition.getDate())) {
            return CompetitionStatus.UPCOMING;
        } else if (now.isAfter(competition.getDate().plusMinutes(competition.getDuration()))) {
            return CompetitionStatus.FINISHED;
        } else {
            return CompetitionStatus.LIVE;
        }
    }

}

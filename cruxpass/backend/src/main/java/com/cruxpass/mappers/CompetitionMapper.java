package com.cruxpass.mappers;

import com.cruxpass.dtos.SimpleRegistrationDto;
import com.cruxpass.dtos.requests.UpdateCompetitionDto;
import com.cruxpass.dtos.responses.CompetitionResponseDto;
import com.cruxpass.dtos.responses.ResolvedCompetitionDto;
import com.cruxpass.dtos.responses.ResolvedHeatDto;
import com.cruxpass.dtos.responses.SimpleCompetitionDto;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Heat;
import com.cruxpass.models.GroupRefs.GroupRefEmbeddable;
import com.cruxpass.resolvers.CompetitorGroupResolver;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CompetitionMapper {

    private final HeatMapper heatMapper;
    private final CompetitorGroupResolver groupResolver;

    public ResolvedCompetitionDto toDto(Competition comp, Gym gym) {
        if (comp == null || gym == null) return null;
        return new ResolvedCompetitionDto(
            comp.getId(),
            gym.getId(),
            comp.getName(),
            comp.getStartDate(),
            comp.getDeadline(),
            comp.getTypes(),
            comp.getCompFormat(),
            comp.getSelectedGroups()
                .stream()
                .map(g -> g.toDomain())
                .map(groupResolver::resolve)
                .collect(Collectors.toSet()),
            heatMapper.toDtoList(comp.getHeats()),
            calculateStatus(comp),
            gym.getName(), 
            gym.getAddress()
        );
    }

    public List<ResolvedCompetitionDto> toDtoList(List<Competition> comps, Gym gym) {
        return comps.stream().map(comp -> toDto(comp, gym)).toList();
    }

    public ResolvedCompetitionDto toDtoWithHeats(Competition comp, List<ResolvedHeatDto> heats, Gym gym) {
        if (comp == null || gym == null) return null;
        return new ResolvedCompetitionDto(
            comp.getId(),
            gym.getId(),
            comp.getName(),
            comp.getStartDate(),
            comp.getDeadline(),
            comp.getTypes(),
            comp.getCompFormat(),
            comp.getSelectedGroups()
                .stream()
                .map(g -> g.toDomain())
                .map(groupResolver::resolve)
                .collect(Collectors.toSet()),
            heats,
            calculateStatus(comp),
            gym.getName(), 
            gym.getAddress()
        );
    }

    public CompetitionResponseDto toResponseDto(Competition comp) {
        if (comp == null) return null;
        comp.setCompStatus(calculateStatus(comp));
        return new CompetitionResponseDto(
            comp, 
            comp.getSelectedGroups()
                .stream()
                .map(g -> g.toDomain())
                .map(groupResolver::resolve)
                .collect(Collectors.toSet()),
            heatMapper.toDtoList(comp.getHeats()),
            false,
            null
        );
    }

    public CompetitionResponseDto toResponseDto(Competition comp, boolean registered, SimpleRegistrationDto simpleRegistration) {
        if (comp == null) return null;
        comp.setCompStatus(calculateStatus(comp));
        return new CompetitionResponseDto(
            comp, 
            comp.getSelectedGroups()
                .stream()
                .map(g -> g.toDomain())
                .map(groupResolver::resolve)
                .collect(Collectors.toSet()),
            heatMapper.toDtoList(comp.getHeats()),
            registered,
            simpleRegistration
        );
    }

    public SimpleCompetitionDto toSimpleDto(Competition comp) {
        if (comp == null) return null;
        comp.setCompStatus(calculateStatus(comp));
        return new SimpleCompetitionDto(
            comp.getId(),
            comp.getGym().getId(),
            comp.getName(),
            comp.getStartDate(),
            comp.getGym().getName(),
            comp.getCompStatus()
        );
    }

    public Competition toEntity(UpdateCompetitionDto dto, Gym gym) {
        if (dto == null || gym == null) return null;
        Competition comp = new Competition();
        comp.setName(dto.name());
        comp.setStartDate(dto.startDate());
        comp.setDeadline(dto.deadline());
        comp.setCompFormat(dto.compFormat());
        comp.setTypes(dto.types());
        comp.setSelectedGroups(dto.selectedGroups()
            .stream()
            .map(GroupRefEmbeddable::fromDomain)
            .collect(Collectors.toSet())
        );
        comp.setCompStatus(calculateStatus(comp));
        comp.setGym(gym);

        return comp;
    }

    public CompetitionStatus calculateStatus(Competition comp) {
        if (comp == null || comp.getStartDate() == null) return null;
        LocalDateTime now = LocalDateTime.now(ZoneId.of("America/Denver"));
        Heat lastHeat = comp.getHeats().getLast();
        if (now.isBefore(comp.getStartDate())) return CompetitionStatus.UPCOMING;
        else if (now.isAfter(lastHeat.getStartTime().plusMinutes(lastHeat.getDuration()))) return CompetitionStatus.FINISHED;
        else return CompetitionStatus.LIVE;
    }

}

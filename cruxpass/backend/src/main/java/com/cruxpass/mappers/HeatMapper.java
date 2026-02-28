package com.cruxpass.mappers;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.cruxpass.dtos.requests.HeatUpsertDto;
import com.cruxpass.dtos.responses.ResolvedHeatDto;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Heat;
import com.cruxpass.models.GroupRefs.GroupRefEmbeddable;
import com.cruxpass.resolvers.CompetitorGroupResolver;

import lombok.AllArgsConstructor;

@Component
@AllArgsConstructor
public class HeatMapper {

    private final CompetitorGroupResolver groupResolver;

    public ResolvedHeatDto toDto(Heat heat) {
        if (heat == null) return null;
        return new ResolvedHeatDto(
            heat.getId(),
            heat.getHeatName(),
            heat.getStartTime(),
            heat.getCapacity(),
            heat.getDuration(),
            heat.getGroups()
                .stream()
                .map(g -> g.toDomain())
                .map(groupResolver::resolve)
                .collect(Collectors.toSet()),
            heat.getDivisions(),
            heat.isDivisionsEnabled()
        );
    }

    public List<ResolvedHeatDto> toDtoList(List<Heat> heats) {
        return heats.stream().map(this::toDto).toList();
    }

    public ResolvedHeatDto toDtoWithGroups(
        Heat heat, 
        Map<Long, Set<GroupRefEmbeddable>> groupsByHeatId
    ) {
        if (heat == null) return null;
        return new ResolvedHeatDto(
            heat.getId(),
            heat.getHeatName(),
            heat.getStartTime(),
            heat.getCapacity(),
            heat.getDuration(),
            groupsByHeatId.getOrDefault(heat.getId(), Set.of())
                .stream()
                .map(GroupRefEmbeddable::toDomain)
                .map(groupResolver::resolve)
                .collect(Collectors.toSet()),
            heat.getDivisions(),
            heat.isDivisionsEnabled()
        );
    }

    public List<ResolvedHeatDto> toDtoListWithGroups(
        List<Heat> heats,
        Map<Long, Set<GroupRefEmbeddable>> groupsByHeatId
    ) {
        return heats.stream().map(h -> toDtoWithGroups(h, groupsByHeatId)).toList();
    }

    public Heat toEntity(HeatUpsertDto dto, Competition comp) {
        if (dto == null || comp == null) return null;
        return new Heat(
            dto.id(),
            dto.heatName(),
            dto.startTime(),
            dto.capacity(),
            dto.duration(),
            dto.groups().stream().map(GroupRefEmbeddable::fromDomain).collect(Collectors.toSet()),
            dto.divisions(),
            dto.divisionsEnabled(),
            comp
        );
    }
    
}

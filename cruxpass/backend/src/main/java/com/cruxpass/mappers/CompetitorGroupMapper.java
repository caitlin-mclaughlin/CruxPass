package com.cruxpass.mappers;

import java.time.Instant;

import org.springframework.stereotype.Component;

import com.cruxpass.dtos.CompetitorGroupDto;
import com.cruxpass.dtos.ResolvedCompetitorGroup;
import com.cruxpass.dtos.requests.CreateCompetitorGroupDto;
import com.cruxpass.enums.OwnerType;
import com.cruxpass.models.CompetitorGroup;

@Component
public class CompetitorGroupMapper {

    public CompetitorGroupDto toDto(CompetitorGroup group) {
        if (group == null) return null;
        return new CompetitorGroupDto(
            group.getId(),
            group.getOwnerId(),
            group.getName(),
            group.isConstrained(),
            group.getAgeRule()
        );
    }

    public ResolvedCompetitorGroup toResolved(CompetitorGroup group) {
        if (group == null) return null;
        return new ResolvedCompetitorGroup(
            group.getId(),
            group.getName(),
            group.getAgeRule()
        );
    }

    public CompetitorGroup createGroupFromDto(CreateCompetitorGroupDto dto, OwnerType type, Long ownerId) {
        if (dto == null) return null;
        CompetitorGroup group = new CompetitorGroup();
        group.setOwnerType(type);
        group.setOwnerId(ownerId);
        group.setName(dto.name());
        group.setConstrained(dto.constrained() && dto.ageRule() != null);
        group.setAgeRule(dto.ageRule());
        group.setUpdatedAt(Instant.now());
        return group;
    }

    public void updateGroupFromDto(CompetitorGroupDto dto, CompetitorGroup group) {
        if (group == null) return;
        group.setName(dto.name());
        group.setConstrained(dto.constrained() && dto.ageRule() != null);
        group.setAgeRule(dto.ageRule());
        group.setUpdatedAt(Instant.now());
    }
}

package com.cruxpass.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.cruxpass.dtos.requests.HeatUpsertDto;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Heat;
import com.cruxpass.models.Series;
import com.cruxpass.models.GroupRefs.GroupRefEmbeddable;
import com.cruxpass.repositories.HeatRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HeatService {
    
    private final HeatRepository heatRepo;
    private final CompetitorGroupService groupService;

    public List<Heat> getByCompetition(Competition comp) {
        return heatRepo.findAllByCompetitionId(comp.getId());
    }
    
    public void applyHeatUpsert(
        Heat heat,
        HeatUpsertDto dto,
        Gym gym,
        Series series
    ) {
        heat.setHeatName(dto.heatName());
        heat.setStartTime(dto.startTime());
        heat.setCapacity(dto.capacity());
        heat.setDuration(dto.duration());
        heat.setDivisionsEnabled(dto.divisionsEnabled());
        if (dto.divisionsEnabled()) heat.setDivisions(dto.divisions());

        groupService.validateGroupRefs(dto.groups(), gym, series);

        List<GroupRefEmbeddable> groups =
            dto.groups().stream()
                .map(GroupRefEmbeddable::fromDomain)
                .toList();

        heat.getGroups().clear();
        heat.getGroups().addAll(groups);
    }
}

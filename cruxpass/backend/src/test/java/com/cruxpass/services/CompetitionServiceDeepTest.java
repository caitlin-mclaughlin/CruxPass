package com.cruxpass.services;

import com.cruxpass.models.Competition;
import com.cruxpass.repositories.CompetitionRepository;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CompetitionServiceDeepTest {

    @Test
    void getByIdReturnsNullWhenNotFound() {
        CompetitionRepository repo = mock(CompetitionRepository.class);
        CompetitorGroupService groupService = mock(CompetitorGroupService.class);
        HeatService heatService = mock(HeatService.class);
        com.cruxpass.mappers.CompetitionMapper compMap = mock(com.cruxpass.mappers.CompetitionMapper.class);
        com.cruxpass.mappers.HeatMapper heatMap = mock(com.cruxpass.mappers.HeatMapper.class);

        CompetitionService svc = new CompetitionService(repo, groupService, heatService, compMap, heatMap);
        when(repo.findById(2L)).thenReturn(java.util.Optional.empty());

        assertNull(svc.getById(2L));
    }
}

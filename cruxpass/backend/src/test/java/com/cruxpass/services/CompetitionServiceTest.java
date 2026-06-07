package com.cruxpass.services;

import static com.cruxpass.support.TestFixtures.gym;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.cruxpass.dtos.requests.CompetitionUpsertDto;
import com.cruxpass.dtos.requests.PricingRuleUpsertDto;
import com.cruxpass.enums.CompetitionFormat;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.enums.CompetitionType;
import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.PricingRuleType;
import com.cruxpass.enums.PricingType;
import com.cruxpass.mappers.CompetitionMapper;
import com.cruxpass.mappers.HeatMapper;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.models.GroupRefs.DefaultGroupRef;
import com.cruxpass.repositories.CompetitionRepository;

class CompetitionServiceTest {

    @Test
    void createCompetitionPersistsTrimmedPricingRuleName() {
        CompetitionRepository competitionRepo = mock(CompetitionRepository.class);
        CompetitorGroupService groupService = mock(CompetitorGroupService.class);
        HeatService heatService = mock(HeatService.class);
        CompetitionMapper competitionMapper = mock(CompetitionMapper.class);
        HeatMapper heatMapper = mock(HeatMapper.class);

        when(competitionMapper.calculateStatus(any(Competition.class)))
            .thenReturn(CompetitionStatus.UPCOMING);

        CompetitionService service = new CompetitionService(
            competitionRepo,
            groupService,
            heatService,
            competitionMapper,
            heatMapper
        );

        Gym gym = gym(7L);
        service.createCompetition(gym, dtoWithPricingRuleName(" Early Bird "));

        ArgumentCaptor<Competition> competitionCaptor = ArgumentCaptor.forClass(Competition.class);
        verify(competitionRepo).save(competitionCaptor.capture());

        Competition saved = competitionCaptor.getValue();
        assertEquals("Early Bird", saved.getPricingRules().get(0).getName());
    }

    @Test
    void createCompetitionPersistsBlankPricingRuleNameAsNull() {
        CompetitionRepository competitionRepo = mock(CompetitionRepository.class);
        CompetitorGroupService groupService = mock(CompetitorGroupService.class);
        HeatService heatService = mock(HeatService.class);
        CompetitionMapper competitionMapper = mock(CompetitionMapper.class);
        HeatMapper heatMapper = mock(HeatMapper.class);

        when(competitionMapper.calculateStatus(any(Competition.class)))
            .thenReturn(CompetitionStatus.UPCOMING);

        CompetitionService service = new CompetitionService(
            competitionRepo,
            groupService,
            heatService,
            competitionMapper,
            heatMapper
        );

        Gym gym = gym(7L);
        service.createCompetition(gym, dtoWithPricingRuleName("   "));

        ArgumentCaptor<Competition> competitionCaptor = ArgumentCaptor.forClass(Competition.class);
        verify(competitionRepo).save(competitionCaptor.capture());

        Competition saved = competitionCaptor.getValue();
        assertNull(saved.getPricingRules().get(0).getName());
    }

    private CompetitionUpsertDto dtoWithPricingRuleName(String ruleName) {
        DefaultGroupRef group = new DefaultGroupRef(DefaultCompetitorGroup.INTERMEDIATE);

        return new CompetitionUpsertDto(
            7L,
            "Spring Boulder Bash",
            LocalDateTime.of(2026, 6, 1, 9, 0),
            LocalDateTime.of(2026, 5, 25, 23, 59),
            Set.of(CompetitionType.BOULDERING),
            CompetitionFormat.CLASSIC_REDPOINT,
            PricingType.BY_GROUP,
            null,
            "USD",
            List.of(new PricingRuleUpsertDto(
                null,
                ruleName,
                PricingRuleType.GROUP,
                Set.of(group),
                null,
                null,
                35,
                1
            )),
            Set.of(group),
            List.of(),
            "Crux Gym",
            null
        );
    }
}

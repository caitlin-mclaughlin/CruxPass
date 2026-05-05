package com.cruxpass.mappers;

import static com.cruxpass.support.TestFixtures.competition;
import static com.cruxpass.support.TestFixtures.defaultGroup;
import static com.cruxpass.support.TestFixtures.gym;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;

import com.cruxpass.dtos.ResolvedCompetitorGroup;
import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.PricingRuleType;
import com.cruxpass.enums.PricingType;
import com.cruxpass.models.Competition;
import com.cruxpass.models.PricingRule;
import com.cruxpass.models.GroupRefs.DefaultGroupRef;
import com.cruxpass.models.GroupRefs.GroupRef;
import com.cruxpass.resolvers.CompetitorGroupResolver;

class CompetitionMapperTest {

    @Test
    void toDtoMapsPricingRuleGroups() {
        HeatMapper heatMapper = mock(HeatMapper.class);
        CompetitorGroupResolver resolver = mock(CompetitorGroupResolver.class);
        when(resolver.resolve(any(GroupRef.class))).thenAnswer(invocation -> {
            GroupRef ref = invocation.getArgument(0);
            if (ref instanceof DefaultGroupRef d) {
                return new ResolvedCompetitorGroup(null, d.key().name(), null);
            }
            return new ResolvedCompetitorGroup(1L, "Custom", null);
        });

        CompetitionMapper mapper = new CompetitionMapper(heatMapper, resolver);
        Competition competition = competition(PricingType.BY_GROUP);
        competition.setGym(gym(7L));
        competition.setPricingRules(List.of(groupPricingRule()));

        var dto = mapper.toDto(competition, competition.getGym());

        assertEquals(PricingType.BY_GROUP, dto.pricingType());
        assertEquals(1, dto.pricingRules().size());
        assertEquals(2, dto.pricingRules().get(0).groups().size());
        assertEquals(
            Set.of("ADVANCED", "INTERMEDIATE"),
            dto.pricingRules().get(0).groups().stream()
                .map(ResolvedCompetitorGroup::name)
                .collect(java.util.stream.Collectors.toSet())
        );
    }

    private PricingRule groupPricingRule() {
        PricingRule rule = new PricingRule();
        rule.setRuleType(PricingRuleType.GROUP);
        rule.setAmount(35);
        rule.setPriority(1);
        rule.setGroups(Set.of(
            defaultGroup(DefaultCompetitorGroup.INTERMEDIATE),
            defaultGroup(DefaultCompetitorGroup.ADVANCED)
        ));
        return rule;
    }
}

package com.cruxpass.repositories;

import static com.cruxpass.support.TestFixtures.competition;
import static com.cruxpass.support.TestFixtures.defaultGroup;
import static com.cruxpass.support.TestFixtures.gym;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.PricingRuleType;
import com.cruxpass.enums.PricingType;
import com.cruxpass.models.Competition;
import com.cruxpass.models.PricingRule;
import com.cruxpass.support.PostgresIntegrationTest;

import jakarta.persistence.EntityManager;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class PricingRuleRepositoryIntegrationTest extends PostgresIntegrationTest {

    @Autowired
    private CompetitionRepository competitionRepository;

    @Autowired
    private GymRepository gymRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void persistsPricingRuleWithMultipleGroups() {
        var savedGym = gymRepository.saveAndFlush(gym(null));

        Competition competition = competition(PricingType.BY_GROUP);
        competition.setGym(savedGym);

        PricingRule pricingRule = new PricingRule();
        pricingRule.setCompetition(competition);
        pricingRule.setRuleType(PricingRuleType.GROUP);
        pricingRule.setAmount(35);
        pricingRule.setPriority(1);
        pricingRule.setGroups(Set.of(
            defaultGroup(DefaultCompetitorGroup.INTERMEDIATE),
            defaultGroup(DefaultCompetitorGroup.ADVANCED)
        ));

        competition.setPricingRules(new ArrayList<>(java.util.List.of(pricingRule)));

        Competition savedCompetition = competitionRepository.saveAndFlush(competition);
        entityManager.clear();

        Competition reloaded = competitionRepository.findById(savedCompetition.getId()).orElseThrow();

        assertThat(reloaded.getPricingRules()).hasSize(1);
        assertThat(reloaded.getPricingRules().get(0).getGroups())
            .extracting(group -> group.getDefaultKey())
            .containsExactlyInAnyOrder(
                DefaultCompetitorGroup.INTERMEDIATE,
                DefaultCompetitorGroup.ADVANCED
            );
    }
}

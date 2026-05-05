package com.cruxpass.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static com.cruxpass.support.TestFixtures.defaultGroup;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.Gender;
import com.cruxpass.enums.GroupRefType;
import com.cruxpass.enums.PricingRuleType;
import com.cruxpass.enums.PricingType;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Competition;
import com.cruxpass.models.PricingRule;
import com.cruxpass.models.GroupRefs.GroupRefEmbeddable;

class CompetitionPricingServiceTest {

    private final CompetitionPricingService service = new CompetitionPricingService();

    @Test
    void quoteForGroupPricingMatchesAnyGroupInRule() {
        Competition competition = competition(PricingType.BY_GROUP);
        competition.setPricingRules(List.of(
            groupRule(25, 2, defaultGroup(DefaultCompetitorGroup.INTERMEDIATE), defaultGroup(DefaultCompetitorGroup.ADVANCED))
        ));

        var quote = service.quoteFor(
            competition,
            climberBornIn(2000),
            defaultGroup(DefaultCompetitorGroup.ADVANCED)
        );

        assertEquals(25, quote.amount());
        assertEquals("USD", quote.currency());
    }

    @Test
    void quoteForGroupPricingUsesHighestPriorityMatchingRule() {
        Competition competition = competition(PricingType.BY_GROUP);
        competition.setPricingRules(List.of(
            groupRule(50, 5, defaultGroup(DefaultCompetitorGroup.REC), defaultGroup(DefaultCompetitorGroup.ADVANCED)),
            groupRule(30, 1, defaultGroup(DefaultCompetitorGroup.ADVANCED))
        ));

        var quote = service.quoteFor(
            competition,
            climberBornIn(2000),
            defaultGroup(DefaultCompetitorGroup.ADVANCED)
        );

        assertEquals(30, quote.amount());
    }

    @Test
    void quoteForGroupPricingThrowsWhenNoRuleIncludesSelectedGroup() {
        Competition competition = competition(PricingType.BY_GROUP);
        competition.setPricingRules(List.of(
            groupRule(25, 1, defaultGroup(DefaultCompetitorGroup.INTERMEDIATE))
        ));

        assertThrows(
            ResponseStatusException.class,
            () -> service.quoteFor(
                competition,
                climberBornIn(2000),
                defaultGroup(DefaultCompetitorGroup.ADVANCED)
            )
        );
    }

    @Test
    void quoteForAgePricingStillMatchesAgeRules() {
        Competition competition = competition(PricingType.BY_AGE);
        competition.setStartDate(LocalDateTime.of(2026, 6, 1, 9, 0));
        competition.setPricingRules(List.of(
            ageRule(10, 1, null, 12),
            ageRule(20, 2, 13, null)
        ));

        var quote = service.quoteFor(
            competition,
            climberBornIn(2010),
            defaultGroup(DefaultCompetitorGroup.REC)
        );

        assertEquals(20, quote.amount());
    }

    private Competition competition(PricingType pricingType) {
        Competition competition = new Competition();
        competition.setPricingType(pricingType);
        competition.setFeeCurrency("USD");
        competition.setStartDate(LocalDateTime.of(2026, 1, 1, 9, 0));
        competition.setPricingRules(List.of());
        return competition;
    }

    private PricingRule groupRule(Integer amount, Integer priority, GroupRefEmbeddable... groups) {
        PricingRule rule = new PricingRule();
        rule.setRuleType(PricingRuleType.GROUP);
        rule.setAmount(amount);
        rule.setPriority(priority);
        rule.setGroups(Set.of(groups));
        return rule;
    }

    private PricingRule ageRule(Integer amount, Integer priority, Integer minAge, Integer maxAge) {
        PricingRule rule = new PricingRule();
        rule.setRuleType(PricingRuleType.AGE);
        rule.setAmount(amount);
        rule.setPriority(priority);
        rule.setMinAge(minAge);
        rule.setMaxAge(maxAge);
        return rule;
    }

    private Climber climberBornIn(int year) {
        Climber climber = new Climber();
        climber.setDob(LocalDate.of(year, 1, 1));
        climber.setGender(Gender.PASS);
        return climber;
    }
}

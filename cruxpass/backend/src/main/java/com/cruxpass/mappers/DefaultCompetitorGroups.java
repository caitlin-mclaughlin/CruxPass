package com.cruxpass.mappers;

import java.util.Map;

import com.cruxpass.enums.AgeRuleType;
import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.models.AgeRule;

public final class DefaultCompetitorGroups {

    private DefaultCompetitorGroups() {}

    public record Meta(String label, AgeRule ageRule) {}

    public static final Map<DefaultCompetitorGroup, Meta> META =
        Map.of(
            DefaultCompetitorGroup.REC,
                new Meta("Rec", null),

            DefaultCompetitorGroup.INTERMEDIATE,
                new Meta("Intermediate", null),

            DefaultCompetitorGroup.ADVANCED,
                new Meta("Advanced", null),

            DefaultCompetitorGroup.OPEN,
                new Meta("Open", null),

            DefaultCompetitorGroup.YOUTH_D,
                new Meta("Ages: 11 and Under",
                    new AgeRule(AgeRuleType.AGE, null, 11)),

            DefaultCompetitorGroup.YOUTH_C,
                new Meta("Ages: 12-13",
                    new AgeRule(AgeRuleType.AGE, 12, 13)),

            DefaultCompetitorGroup.YOUTH_B,
                new Meta("Ages: 14-15",
                    new AgeRule(AgeRuleType.AGE, 14, 15)),

            DefaultCompetitorGroup.YOUTH_A,
                new Meta("Ages: 16-17",
                    new AgeRule(AgeRuleType.AGE, 16, 17)),

            DefaultCompetitorGroup.JUNIOR,
                new Meta("Ages: 18-19",
                    new AgeRule(AgeRuleType.AGE, 18, 19))
        );
}

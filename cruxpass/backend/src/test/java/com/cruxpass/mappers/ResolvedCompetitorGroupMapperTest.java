package com.cruxpass.mappers;

import static com.cruxpass.support.TestFixtures.customGroup;
import static com.cruxpass.support.TestFixtures.defaultGroup;
import static com.cruxpass.support.TestFixtures.resolvedDefaultGroup;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;

import org.junit.jupiter.api.Test;

import com.cruxpass.dtos.ResolvedCompetitorGroup;
import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.GroupRefType;
import com.cruxpass.resolvers.CompetitorGroupResolver;

class ResolvedCompetitorGroupMapperTest {

    private final ResolvedCompetitorGroupMapper mapper =
        new ResolvedCompetitorGroupMapper(mock(CompetitorGroupResolver.class));

    @Test
    void toEmbeddableMapsCustomResolvedGroupById() {
        var embeddable = mapper.toEmbeddable(new ResolvedCompetitorGroup(42L, "Local Youth", null));

        assertEquals(GroupRefType.CUSTOM, embeddable.getType());
        assertEquals(42L, embeddable.getCustomGroupId());
        assertNull(embeddable.getDefaultKey());
    }

    @Test
    void toEmbeddableMapsDefaultResolvedGroupByDisplayLabel() {
        var embeddable = mapper.toEmbeddable(resolvedDefaultGroup("Intermediate"));

        assertEquals(GroupRefType.DEFAULT, embeddable.getType());
        assertEquals(DefaultCompetitorGroup.INTERMEDIATE, embeddable.getDefaultKey());
        assertNull(embeddable.getCustomGroupId());
    }

    @Test
    void toTopicTokenUsesStableDefaultAndCustomTokens() {
        assertEquals("ADVANCED", mapper.toTopicToken(defaultGroup(DefaultCompetitorGroup.ADVANCED)));
        assertEquals("CUSTOM-77", mapper.toTopicToken(customGroup(77L)));
        assertEquals("UNKNOWN", mapper.toTopicToken(null));
    }
}

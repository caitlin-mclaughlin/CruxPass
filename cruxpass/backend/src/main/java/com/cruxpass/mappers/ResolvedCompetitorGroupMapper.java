package com.cruxpass.mappers;

import java.util.Arrays;

import org.springframework.stereotype.Component;

import com.cruxpass.dtos.ResolvedCompetitorGroup;
import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.GroupRefType;
import com.cruxpass.models.GroupRefs.GroupRefEmbeddable;
import com.cruxpass.resolvers.CompetitorGroupResolver;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ResolvedCompetitorGroupMapper {

    private final CompetitorGroupResolver resolver;

    public ResolvedCompetitorGroup toResolved(DefaultCompetitorGroup group) {
        if (group == null) return null;
        var meta = DefaultCompetitorGroups.META.get(group);
        if (meta == null) return null;
        return new ResolvedCompetitorGroup(null, meta.label(), meta.ageRule());
    }

    public ResolvedCompetitorGroup toResolved(GroupRefEmbeddable groupRef) {
        if (groupRef == null) return null;
        return resolver.resolve(groupRef.toDomain());
    }

    public GroupRefEmbeddable toEmbeddable(ResolvedCompetitorGroup group) {
        if (group == null) return null;
        if (group.id() != null) {
            return new GroupRefEmbeddable(GroupRefType.CUSTOM, null, group.id());
        }
        return new GroupRefEmbeddable(GroupRefType.DEFAULT, toDefaultKey(group), null);
    }

    public String toTopicToken(GroupRefEmbeddable groupRef) {
        if (groupRef == null || groupRef.getType() == null) return "UNKNOWN";
        if (groupRef.getType() == GroupRefType.DEFAULT && groupRef.getDefaultKey() != null) {
            return groupRef.getDefaultKey().name();
        }
        if (groupRef.getType() == GroupRefType.CUSTOM && groupRef.getCustomGroupId() != null) {
            return "CUSTOM-" + groupRef.getCustomGroupId();
        }
        return "UNKNOWN";
    }

    public DefaultCompetitorGroup toDefault(ResolvedCompetitorGroup group) {
        return toDefaultKey(group);
    }

    private DefaultCompetitorGroup toDefaultKey(ResolvedCompetitorGroup group) {
        if (group == null || group.name() == null || group.name().isBlank()) {
            return null;
        }

        String raw = group.name().trim();
        try {
            return DefaultCompetitorGroup.valueOf(raw);
        } catch (IllegalArgumentException ignored) {
            // Fall through to label matching.
        }

        return Arrays.stream(DefaultCompetitorGroup.values())
            .filter(g -> {
                var meta = DefaultCompetitorGroups.META.get(g);
                return meta != null && meta.label().equalsIgnoreCase(raw);
            })
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Unknown default competitor group: " + raw));
    }
}

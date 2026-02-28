package com.cruxpass.models.GroupRefs;

import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.GroupRefType;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupRefEmbeddable {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupRefType type; // DEFAULT or CUSTOM

    // for DEFAULT
    @Enumerated(EnumType.STRING)
    private DefaultCompetitorGroup defaultKey;

    // for CUSTOM
    private Long customGroupId;

    /* ---------- Mapping helpers ---------- */

    public static GroupRefEmbeddable fromDomain(GroupRef ref) {
        if (ref instanceof DefaultGroupRef d) {
            return new GroupRefEmbeddable(GroupRefType.DEFAULT, d.key(), null);
        }
        if (ref instanceof CustomGroupRef c) {
            return new GroupRefEmbeddable(GroupRefType.CUSTOM, null, c.id());
        }
        throw new IllegalStateException("Unknown GroupRef");
    }

    public GroupRef toDomain() {
        return switch (type) {
            case DEFAULT -> new DefaultGroupRef(defaultKey);
            case CUSTOM -> new CustomGroupRef(customGroupId);
        };
    }
}


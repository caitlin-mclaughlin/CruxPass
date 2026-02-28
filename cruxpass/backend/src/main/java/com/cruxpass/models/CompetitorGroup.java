package com.cruxpass.models;

import java.time.Instant;

import com.cruxpass.enums.OwnerType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Data
@Table(
    indexes = {
        @Index(name = "idx_group_owner", columnList = "ownerType, ownerId")
    },
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_group_owner_name",
            columnNames = {"ownerType", "ownerId", "name"}
        )
    }
)
public class CompetitorGroup {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OwnerType ownerType; // GYM or SERIES

    @Column(nullable = false)
    private Long ownerId;

    @NotBlank
    private String name;

    @Column(nullable = true)
    private boolean constrained;

    @Embedded
    private AgeRule ageRule;

    private Instant updatedAt;

    @Column(nullable = false)
    private boolean deleted = false;

    private Instant deletedAt;

}
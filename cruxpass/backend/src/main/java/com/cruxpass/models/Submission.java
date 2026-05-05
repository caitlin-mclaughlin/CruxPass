package com.cruxpass.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

import org.springframework.lang.NonNull;

import com.cruxpass.enums.Division;
import com.cruxpass.models.GroupRefs.GroupRefEmbeddable;
import com.fasterxml.jackson.annotation.JsonIgnore;

@AllArgsConstructor
@Data
@Entity
@NoArgsConstructor
@Table(
    name = "submission",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"competition_id", "climber_id"})
    }
)
public class Submission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "climber_id", nullable = false)
    private Climber climber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "competition_id", nullable = false)
    private Competition competition;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "type", column = @Column(name = "competitor_group_type", nullable = false)),
        @AttributeOverride(name = "defaultKey", column = @Column(name = "competitor_group_default_key")),
        @AttributeOverride(name = "customGroupId", column = @Column(name = "competitor_group_custom_id"))
    })
    private GroupRefEmbeddable competitorGroupRef;

    private int totalPoints;
    private int totalAttempts;

    @Enumerated(EnumType.STRING)
    private Division division;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id")
    private Registration registration;

    @JsonIgnore
    @OneToMany(
        mappedBy = "submission",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<SubmittedRoute> routes = new ArrayList<>();
}

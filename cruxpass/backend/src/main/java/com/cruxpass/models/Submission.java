package com.cruxpass.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import org.springframework.lang.NonNull;

import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Division;
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

    @NonNull
    @Enumerated(EnumType.STRING)
    private CompetitorGroup competitorGroup;

    private int totalPoints;
    private int totalAttempts;

    @Enumerated(EnumType.STRING)
    private Division division;

    @JsonIgnore
    @OneToMany(
        mappedBy = "submission",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<SubmittedRoute> routes;
}
package com.cruxpass.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import org.springframework.lang.NonNull;

import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Gender;
import com.fasterxml.jackson.annotation.JsonIgnore;

@AllArgsConstructor
@Data
@Entity
@NoArgsConstructor
public class Submission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "climber_id", nullable = false)
    private Climber climber;

    @ManyToOne
    @JoinColumn(name = "competition_id", nullable = false)
    private Competition competition;

    @NonNull
    @Enumerated(EnumType.STRING)
    private CompetitorGroup competitorGroup;

    @Enumerated(EnumType.STRING)
    private Gender division;

    @JsonIgnore
    @OneToMany(mappedBy = "submission")
    private List<SubmittedRoute> routes;
}
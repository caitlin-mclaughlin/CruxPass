package com.cruxpass.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import com.cruxpass.enums.CompetitionFormat;
import com.cruxpass.enums.CompetitionType;
import com.cruxpass.enums.CompetitorGroup;
import com.fasterxml.jackson.annotation.JsonIgnore;

@AllArgsConstructor
@Data
@Entity
@NoArgsConstructor
public class Competition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;
    @NonNull
    private LocalDateTime date;
    
    @NonNull
    @ElementCollection(targetClass = CompetitionType.class)
    @Enumerated(EnumType.STRING)
    private Set<CompetitionType> types;

    @NonNull
    @Enumerated(EnumType.STRING)
    private CompetitionFormat format;

    @NonNull
    @ElementCollection(targetClass = CompetitorGroup.class)
    @Enumerated(EnumType.STRING)
    private Set<CompetitorGroup> competitorGroups;
    
    @NonNull
    @ManyToOne
    @JoinColumn(name = "gym_id")
    @JsonIgnore
    private Gym gym;

    @JsonIgnore
    @OneToMany(mappedBy = "competition")
    private List<Route> routes;

    @JsonIgnore
    @OneToMany(mappedBy = "competition")
    private List<Registration> registrations;
}
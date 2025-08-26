package com.cruxpass.models;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Set;

import com.cruxpass.enums.CompetitionFormat;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.enums.CompetitionType;
import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Gender;
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
    @Positive
    private long duration;
    @NonNull
    private LocalDateTime deadline;
    @Positive
    private int capacity;
    
    @NonNull
    @ElementCollection(targetClass = CompetitionType.class, fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    private Set<CompetitionType> types;

    @NonNull
    @Enumerated(EnumType.STRING)
    private CompetitionFormat compFormat;

    @NonNull
    @ElementCollection(targetClass = CompetitorGroup.class, fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    private Set<CompetitorGroup> competitorGroups;

    @Nullable
    @ElementCollection(targetClass = Gender.class, fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    private Set<Gender> divisions;

    @NonNull
    @Enumerated(EnumType.STRING)
    private CompetitionStatus compStatus;

    @ManyToOne
    @JoinColumn(name = "gym_id", nullable = false)
    @JsonIgnore
    private Gym gym;

    @JsonIgnore
    @OneToMany(mappedBy = "competition")
    private List<Route> routes;

    @JsonIgnore
    @OneToMany(mappedBy = "competition")
    private List<Registration> registrations;

    
    public CompetitionStatus getCompStatus() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("America/Denver"));

        if (now.isBefore(date)) {
            compStatus =  CompetitionStatus.UPCOMING;
        } else if (now.isAfter(date.plusMinutes(duration))) {
            compStatus = CompetitionStatus.FINISHED;
        } else {
            compStatus = CompetitionStatus.LIVE;
        }

        return compStatus;
    }

    public boolean isPastDeadline() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("America/Denver"));

        if (now.isBefore(deadline)) {
            return false;
        } else {
            return true;
        }
    }
}
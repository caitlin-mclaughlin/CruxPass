package com.cruxpass.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.cruxpass.enums.CompetitionFormat;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.enums.CompetitionType;
import com.cruxpass.models.GroupRefs.GroupRefEmbeddable;
import com.fasterxml.jackson.annotation.JsonIgnore;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Competition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;
    @NonNull
    private LocalDateTime startDate;
    @NonNull
    private LocalDateTime deadline;
    
    @NonNull
    @ElementCollection(targetClass = CompetitionType.class, fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    private Set<CompetitionType> types = new HashSet<>();

    @NonNull
    @Enumerated(EnumType.STRING)
    private CompetitionFormat compFormat;

    @ElementCollection
    @CollectionTable(
        name = "competition_selected_groups",
        joinColumns = @JoinColumn(name = "competition_id")
    )
    private Set<GroupRefEmbeddable> selectedGroups = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("startTime ASC")
    private List<Heat> heats = new ArrayList<>();

    @NonNull
    @Enumerated(EnumType.STRING)
    private CompetitionStatus compStatus;
    
    @JsonIgnore
    @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Route> routes = new ArrayList<>();

    @JoinColumn(name = "gym_id", nullable = false)
    @JsonIgnore
    @ManyToOne
    private Gym gym;

    @JoinColumn(name = "series_id", nullable = true)
    @JsonIgnore
    @ManyToOne
    private Series series;

    @JsonIgnore
    @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Registration> registrations = new ArrayList<>();

    public boolean isPastDeadline() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("America/Denver"));

        if (now.isBefore(deadline)) {
            return false;
        } else {
            return true;
        }
    }
}
package com.cruxpass.models;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.cruxpass.enums.Division;
import com.cruxpass.models.GroupRefs.GroupRefEmbeddable;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Data
public class Heat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    
    private Long id;

    private String heatName;

    @NonNull
    private LocalDateTime startTime;

    @Positive
    private int capacity;

    @Positive
    private int duration;

    @ElementCollection
    @CollectionTable(
        name = "heat_groups",
        joinColumns = @JoinColumn(name = "heat_id")
    )
    private Set<GroupRefEmbeddable> groups = new HashSet<>();

    @ElementCollection(targetClass = Division.class, fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    private Set<Division> divisions = new HashSet<>();

    private boolean divisionsEnabled;

    @ManyToOne
    @JsonIgnore
    private Competition competition;
}

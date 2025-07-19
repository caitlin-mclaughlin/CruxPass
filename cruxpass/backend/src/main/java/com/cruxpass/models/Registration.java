package com.cruxpass.models;

import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Gender;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

@AllArgsConstructor
@Data
@Entity
@NoArgsConstructor
public class Registration {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private boolean paid;

    @NonNull
    @Enumerated(EnumType.STRING)
    private CompetitorGroup competitorGroup;

    @NonNull
    @Enumerated(EnumType.STRING)
    Gender gender;

    @ManyToOne
    @NonNull
    private Climber climber;

    @ManyToOne
    @NonNull
    private Competition competition;

}
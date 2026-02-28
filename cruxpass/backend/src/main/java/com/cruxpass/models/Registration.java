package com.cruxpass.models;

import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.Division;

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
    private DefaultCompetitorGroup competitorGroup;

    @NonNull
    @Enumerated(EnumType.STRING)
    Division division;

    @JoinColumn(name = "climber_id", nullable = false)
    @ManyToOne
    private Climber climber;

    @JoinColumn(name = "competition_id", nullable = false)
    @ManyToOne
    private Competition competition;

}
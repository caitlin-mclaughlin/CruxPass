package com.cruxpass.models;

import org.springframework.lang.NonNull;

import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Gender;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Data
@Entity
@NoArgsConstructor
public class SeriesRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JoinColumn(name = "series_id", nullable = false)
    @ManyToOne
    private Series series;

    @JoinColumn(name = "climber_id", nullable = false)
    @ManyToOne
    private Climber climber;

    @NonNull
    @Enumerated(EnumType.STRING)
    private CompetitorGroup competitorGroup;

    @NonNull
    @Enumerated(EnumType.STRING)
    private Gender division;
}

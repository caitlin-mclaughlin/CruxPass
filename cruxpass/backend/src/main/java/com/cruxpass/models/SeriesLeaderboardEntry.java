package com.cruxpass.models;

import java.util.ArrayList;
import java.util.List;

import org.springframework.lang.NonNull;

import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Gender;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
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
public class SeriesLeaderboardEntry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JoinColumn(name = "series_id", nullable = false)
    @ManyToOne
    private Series series;

    @NonNull
    @Enumerated(EnumType.STRING)
    private CompetitorGroup competitorGroup;

    @NonNull
    @Enumerated(EnumType.STRING)
    private Gender division;

    @JoinColumn(name = "climber_id", nullable = false)
    @ManyToOne
    private Climber climber;

    private int totalSeriesPoints = 0;
    private int rawClimbingPoints = 0;
    private int totalAttempts = 0;

    private Integer rank;

    @ElementCollection
    @CollectionTable(name = "series_entry_placements", joinColumns = @JoinColumn(name = "entry_id"))
    private List<Integer> placementCounts = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "series_entry_results", joinColumns = @JoinColumn(name = "entry_id"))
    private List<CompetitionResult> results = new ArrayList<>();

    public void addCompetitionResult(Long competitionId, String competitionName,
                                     int placement, int seriesPoints,
                                     int rawPoints, int attempts) {
        this.totalSeriesPoints += seriesPoints;
        this.rawClimbingPoints += rawPoints;
        this.totalAttempts += attempts;

        while (placementCounts.size() < placement) {
            placementCounts.add(0);
        }
        placementCounts.set(placement - 1, placementCounts.get(placement - 1) + 1);

        results.add(new CompetitionResult(
            competitionId, series.getId(), placement, seriesPoints
        ));
    }
}

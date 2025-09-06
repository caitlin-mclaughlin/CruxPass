package com.cruxpass.models;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Embeddable
@Getter
@NoArgsConstructor
public class CompetitionResult {

    private Long competitionId;
    private Long seriesId;
    private int placement;
    private int seriesPoints;
}

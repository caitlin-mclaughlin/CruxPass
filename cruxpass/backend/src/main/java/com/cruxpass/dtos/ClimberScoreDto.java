package com.cruxpass.dtos;

import java.time.LocalDateTime;
import lombok.NonNull;

public class ClimberScoreDto {
    public String competitionName;
    public LocalDateTime date;
    public int score;

    public ClimberScoreDto(String competitionName, LocalDateTime date, int score) {
        this.competitionName = competitionName;
        this.date = date;
        this.score = score;
    }
}

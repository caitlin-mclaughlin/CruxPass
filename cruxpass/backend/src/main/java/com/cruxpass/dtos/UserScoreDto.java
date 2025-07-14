package com.cruxpass.dtos;

import java.time.LocalDateTime;
import lombok.NonNull;

public class UserScoreDto {
    public String competitionName;
    public LocalDateTime date;
    public int score;

    public UserScoreDto(String competitionName, LocalDateTime date, int score) {
        this.competitionName = competitionName;
        this.date = date;
        this.score = score;
    }
}

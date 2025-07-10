package com.cruxpass.dtos;

import java.time.LocalDate;

public class UserScoreDto {
    public String competitionName;
    public LocalDate date;
    public int score;

    public UserScoreDto(String competitionName, LocalDate date, int score) {
        this.competitionName = competitionName;
        this.date = date;
        this.score = score;
    }
}

package com.cruxpass.dtos;

public class RegionalScoreDto {
    public String name;
    public String series;
    public int totalPoints;

    public RegionalScoreDto(String name, String series, int totalPoints) {
        this.name = name;
        this.series = series;
        this.totalPoints = totalPoints;
    }
}

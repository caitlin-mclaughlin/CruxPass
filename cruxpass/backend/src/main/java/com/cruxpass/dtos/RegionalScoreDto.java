package com.cruxpass.dtos;

public class RegionalScoreDto {
    public String name;
    public String region;
    public int totalPoints;

    public RegionalScoreDto(String name, String region, int totalPoints) {
        this.name = name;
        this.region = region;
        this.totalPoints = totalPoints;
    }
}

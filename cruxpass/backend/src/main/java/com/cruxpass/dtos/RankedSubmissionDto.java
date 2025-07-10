package com.cruxpass.dtos;

import java.util.List;

public class RankedSubmissionDto {
    public int placement;
    public String name;
    public int totalScore;
    public List<Integer> routePoints;
    public List<Integer> attempts;

    public RankedSubmissionDto(int placement, String name, int totalScore,
                               List<Integer> routePoints, List<Integer> attempts) {
        this.placement = placement;
        this.name = name;
        this.totalScore = totalScore;
        this.routePoints = routePoints;
        this.attempts = attempts;
    }
}

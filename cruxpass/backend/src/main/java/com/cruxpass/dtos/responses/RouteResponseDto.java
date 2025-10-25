package com.cruxpass.dtos.responses;

import com.cruxpass.enums.BoulderGrade;

public record RouteResponseDto(
    Long id,
    int number,
    int pointValue,
    BoulderGrade grade
) {}

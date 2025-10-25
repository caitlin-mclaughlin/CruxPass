package com.cruxpass.dtos;

import com.cruxpass.enums.BoulderGrade;

public record RouteDto(
    int number,
    int pointValue,
    BoulderGrade grade
) {}

package com.cruxpass.dtos.requests;

import com.cruxpass.enums.BoulderGrade;

public record RouteUpsertDto(
    Integer number,
    Integer pointValue,
    BoulderGrade grade
) {}

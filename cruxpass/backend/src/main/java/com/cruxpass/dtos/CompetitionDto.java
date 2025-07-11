package com.cruxpass.dtos;

import java.time.LocalDate;

public record CompetitionDto (
  Long id,
  String name,
  LocalDate date,
  String category,
  String gymName
) {}

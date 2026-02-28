package com.cruxpass.dtos.responses;

import java.time.LocalDateTime;
import java.util.Set;

import com.cruxpass.dtos.ResolvedCompetitorGroup;
import com.cruxpass.enums.Division;

public record ResolvedHeatDto(
    Long id,
    String heatName,
    LocalDateTime startTime,
    int capacity,
    int duration,
    Set<ResolvedCompetitorGroup> groups,
    Set<Division> divisions,
    boolean divisionsEnabled
) {}

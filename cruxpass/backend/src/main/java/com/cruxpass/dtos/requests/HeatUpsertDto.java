package com.cruxpass.dtos.requests;

import java.time.LocalDateTime;
import java.util.Set;

import com.cruxpass.enums.Division;
import com.cruxpass.models.GroupRefs.GroupRef;

public record HeatUpsertDto(
    Long id, //nullable
    String heatName,
    LocalDateTime startTime,
    int capacity,
    int duration,
    Set<GroupRef> groups,
    Set<Division> divisions,
    boolean divisionsEnabled
) {}

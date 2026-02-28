package com.cruxpass.dtos.requests;

import java.util.List;

import com.cruxpass.dtos.CompetitorGroupDto;

public record GroupMutationsDto(
    List<CreateCompetitorGroupDto> created,
    List<CompetitorGroupDto> updated,
    List<Long> deleted
) {}

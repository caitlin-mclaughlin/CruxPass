package com.cruxpass.dtos.responses;

import java.util.List;
import java.util.Set;

import com.cruxpass.dtos.SimpleRegistrationDto;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.enums.Gender;

public record CompLeaderboardResponseDto(
    Long compId,
    Long gymId,
    String name,
    Set<String> types,
    Set<String> competitorGroups,
    Set<Gender> divisions,
    CompetitionStatus compStatus,
    List<SimpleRegistrationDto> registrations,
    boolean currentUserRegistered
) {}

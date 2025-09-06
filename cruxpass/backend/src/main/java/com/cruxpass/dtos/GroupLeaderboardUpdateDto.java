// GroupLeaderboardUpdateDto.java
package com.cruxpass.dtos;

import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Gender;
import java.util.List;

public record GroupLeaderboardUpdateDto(
    Long competitionId,
    CompetitorGroup group,
    Gender division,
    List<RankedSubmissionDto> leaderboard
) {}

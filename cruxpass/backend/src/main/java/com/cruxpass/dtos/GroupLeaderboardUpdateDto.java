// GroupLeaderboardUpdateDto.java
package com.cruxpass.dtos;

import com.cruxpass.enums.Division;
import java.util.List;

public record GroupLeaderboardUpdateDto(
    Long competitionId,
    ResolvedCompetitorGroup group,
    Division division,
    List<RankedSubmissionDto> leaderboard
) {}

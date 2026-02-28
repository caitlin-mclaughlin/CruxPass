// GroupLeaderboardUpdateDto.java
package com.cruxpass.dtos;

import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.Division;
import java.util.List;

public record GroupLeaderboardUpdateDto(
    Long competitionId,
    DefaultCompetitorGroup group,
    Division division,
    List<RankedSubmissionDto> leaderboard
) {}

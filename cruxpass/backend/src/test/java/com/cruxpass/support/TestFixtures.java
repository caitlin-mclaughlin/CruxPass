package com.cruxpass.support;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import com.cruxpass.dtos.ResolvedCompetitorGroup;
import com.cruxpass.dtos.responses.ResolvedCompetitionDto;
import com.cruxpass.enums.CompetitionFormat;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.enums.CompetitionType;
import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.Gender;
import com.cruxpass.enums.GroupRefType;
import com.cruxpass.enums.PricingType;
import com.cruxpass.models.Address;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Competition;
import com.cruxpass.models.GroupRefs.GroupRefEmbeddable;
import com.cruxpass.models.Gym;
import com.cruxpass.models.SeriesLeaderboardEntry;

public final class TestFixtures {

    private TestFixtures() {}

    public static GroupRefEmbeddable defaultGroup(DefaultCompetitorGroup group) {
        return new GroupRefEmbeddable(GroupRefType.DEFAULT, group, null);
    }

    public static GroupRefEmbeddable customGroup(Long id) {
        return new GroupRefEmbeddable(GroupRefType.CUSTOM, null, id);
    }

    public static ResolvedCompetitorGroup resolvedDefaultGroup(String name) {
        return new ResolvedCompetitorGroup(null, name, null);
    }

    public static Climber climber(String name) {
        Climber climber = new Climber();
        climber.setName(name);
        climber.setDob(LocalDate.of(2000, 1, 1));
        climber.setGender(Gender.PASS);
        return climber;
    }

    public static SeriesLeaderboardEntry leaderboardEntry(
        String climberName,
        int seriesPoints,
        List<Integer> placementCounts,
        int rawPoints,
        int attempts
    ) {
        SeriesLeaderboardEntry entry = new SeriesLeaderboardEntry();
        entry.setClimber(climber(climberName));
        entry.setTotalSeriesPoints(seriesPoints);
        entry.setPlacementCounts(placementCounts);
        entry.setRawClimbingPoints(rawPoints);
        entry.setTotalAttempts(attempts);
        return entry;
    }

    public static Competition competition(PricingType pricingType) {
        Competition competition = new Competition();
        competition.setName("Spring Boulder Bash");
        competition.setStartDate(LocalDateTime.of(2026, 6, 1, 9, 0));
        competition.setDeadline(LocalDateTime.of(2026, 5, 25, 23, 59));
        competition.setTypes(Set.of(CompetitionType.BOULDERING));
        competition.setCompFormat(CompetitionFormat.CLASSIC_REDPOINT);
        competition.setPricingType(pricingType);
        competition.setFeeCurrency("USD");
        competition.setCompStatus(CompetitionStatus.UPCOMING);
        return competition;
    }

    public static Gym gym(Long id) {
        Gym gym = new Gym();
        gym.setId(id);
        gym.setName("Crux Gym");
        gym.setEmail("gym@example.com");
        gym.setUsername("cruxgym");
        gym.setPhone("555-0100");
        gym.setPasswordHash("hashed-password");
        gym.setAddress(address());
        return gym;
    }

    public static Address address() {
        Address address = new Address();
        address.setStreetAddress("123 Wall St");
        address.setCity("Denver");
        address.setState("CO");
        address.setZipCode("80202");
        return address;
    }

    public static ResolvedCompetitionDto resolvedCompetition(Long id, String name) {
        return new ResolvedCompetitionDto(
            id,
            10L,
            name,
            LocalDateTime.of(2026, 6, 1, 9, 0),
            LocalDateTime.of(2026, 5, 25, 23, 59),
            Set.of(CompetitionType.BOULDERING),
            CompetitionFormat.CLASSIC_REDPOINT,
            PricingType.FLAT,
            40,
            "USD",
            List.of(),
            Set.of(),
            List.of(),
            CompetitionStatus.UPCOMING,
            "Crux Gym",
            address()
        );
    }
}

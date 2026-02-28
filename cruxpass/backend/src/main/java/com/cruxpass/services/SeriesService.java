package com.cruxpass.services;

import com.cruxpass.dtos.SeriesDto;
import com.cruxpass.dtos.SeriesLeaderboardEntryDto;
import com.cruxpass.dtos.requests.RegisterRequest;
import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.Division;
import com.cruxpass.mappers.SeriesMapper;
import com.cruxpass.mappers.SeriesLeaderboardEntryMapper;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Series;
import com.cruxpass.models.SeriesLeaderboardEntry;
import com.cruxpass.repositories.CompetitionRepository;
import com.cruxpass.repositories.GymRepository;
import com.cruxpass.repositories.SeriesRepository;
import com.cruxpass.utils.SeriesLeaderboardComparator;
import com.cruxpass.utils.SeriesLeaderboardUtils;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

@RequiredArgsConstructor
@Service
public class SeriesService {

    private final SeriesRepository seriesRepo;
    private final GymRepository gymRepo;
    private final CompetitionRepository competitionRepo;
    private final SeriesLeaderboardEntryService leaderboardService;

    private final SeriesMapper seriesMap;
    private final SeriesLeaderboardEntryMapper leaderboardEntryMap;

    private final PasswordEncoder passwordEncoder;

    public Series getById(Long id) {
        return seriesRepo.findById(id).orElse(null);
    }

    public Series getByIdWithGyms(Long id) {
        return seriesRepo.findByIdWithGyms(id).orElse(null);
    }

    public Series getByUsername(String username) {
        return seriesRepo.findByUsernameAndActiveTrue(username).orElse(null);
    }

    public List<Series> getAll() {
        return seriesRepo.findAll();
    }

    public List<Series> getByGymId(Long gymId) {
        return seriesRepo.findByGyms_IdAndActiveTrue(gymId);
    }

    public List<Series> searchSeries(String email, String name) {
        if ((email == null || email.isBlank()) &&
            (name == null || name.isBlank())) {
            return List.of();
        }

        return seriesRepo.searchSeriesFlexible(email, name);
    }

    @Transactional
    public Series save(Series series) {
        return seriesRepo.save(series);
    }

    public boolean passwordMatches(Series series, String rawPassword) {
        return passwordEncoder.matches(rawPassword, series.getPasswordHash());
    }

    /**
     * Create a new series
     */
    @Transactional
    public SeriesDto createSeries(SeriesDto dto) {
        // Fetch competitions by IDs from the dto
        Series series = seriesMap.toEntity(dto);
        return seriesMap.toDto(seriesRepo.save(series));
    }

    @Transactional
    public Series createSimpleSeries(RegisterRequest dto) {
        if (seriesRepo.findByEmailIgnoreCaseAndActiveTrue(dto.email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        } else if (seriesRepo.findByUsernameAndActiveTrue(dto.username).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already in use");
        }

        Series series = new Series();
        series.setName(dto.name);
        series.setUsername(dto.username == null ? dto.email : dto.username); // Or use a custom field if desired
        series.setEmail(dto.email);
        series.setPasswordHash(passwordEncoder.encode(dto.password));

        return seriesRepo.save(series);
    }

    /**
     * Get leaderboard for a series, filtered by group/division.
     * Delegates scoring logic to SeriesLeaderboardEntryService.
     */
    @Transactional(readOnly = true)
    public List<SeriesLeaderboardEntryDto> getLeaderboard(Long seriesId,
                                                          DefaultCompetitorGroup group,
                                                          Division division) {
        List<SeriesLeaderboardEntry> entries =
                leaderboardService.rebuildLeaderboard(seriesId, group, division);

        // sort + assign ranks
        SeriesLeaderboardUtils.assignRanks(entries);

        // map to DTOs
        return entries.stream()
                .sorted(new SeriesLeaderboardComparator())
                .map(leaderboardEntryMap::toDto)
                .toList();
    }

    /**
     * Rebuild the series leaderboard when a competition in this series finishes.
     * Could be triggered by a CompetitionService event.
     * Uses rebuildLeaderboard to process all registered climbers and apply series scoring rules.
     */
    @Transactional
    public void updateLeaderboardAfterCompetition(Long seriesId, DefaultCompetitorGroup group, Division division) {
        leaderboardService.rebuildLeaderboard(seriesId, group, division);
    }

    @Transactional
    public void linkGym(Series series, Gym gym) {
        boolean alreadyLinked = series.getGyms().stream()
            .anyMatch(g -> Objects.equals(g.getId(), gym.getId()));

        if (!alreadyLinked) {
            series.getGyms().add(gym);
            gym.getSeries().add(series);
            seriesRepo.save(series);
            gymRepo.save(gym);
        }
    }

    @Transactional
    public void linkCompetition(Series series, Competition competition) {
        boolean alreadyLinked = series.getCompetitions().stream()
            .anyMatch(c -> Objects.equals(c.getId(), competition.getId()));

        if (!alreadyLinked) {
            series.getCompetitions().add(competition);
            competition.setSeries(series);
            seriesRepo.save(series);
            competitionRepo.save(competition);
        }
    }

    @Transactional
    public void unlinkGym(Series series, Gym gym) {
        boolean alreadyLinked = series.getGyms().stream()
            .anyMatch(g -> Objects.equals(g.getId(), gym.getId()));

        if (alreadyLinked) {
            series.getGyms().remove(gym);
            gym.getSeries().remove(series);
            seriesRepo.save(series);
            gymRepo.save(gym);
        }
    }

    @Transactional
    public void unlinkCompetition(Series series, Competition competition) {
        boolean alreadyLinked = series.getCompetitions().stream()
            .anyMatch(c -> Objects.equals(c.getId(), competition.getId()));

        if (alreadyLinked) {
            series.getCompetitions().remove(competition);
            competition.setSeries(null);
            seriesRepo.save(series);
            competitionRepo.save(competition);
        }
    }

}

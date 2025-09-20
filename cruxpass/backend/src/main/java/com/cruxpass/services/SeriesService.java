package com.cruxpass.services;

import com.cruxpass.dtos.SeriesDto;
import com.cruxpass.dtos.SeriesLeaderboardEntryDto;
import com.cruxpass.dtos.requests.RegisterRequest;
import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Gender;
import com.cruxpass.mappers.SeriesMapper;
import com.cruxpass.mappers.SeriesLeaderboardEntryMapper;
import com.cruxpass.models.Series;
import com.cruxpass.models.SeriesLeaderboardEntry;
import com.cruxpass.repositories.SeriesRepository;
import com.cruxpass.utils.SeriesLeaderboardComparator;
import com.cruxpass.utils.SeriesLeaderboardUtils;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class SeriesService {

    private final SeriesRepository seriesRepo;
    private final SeriesLeaderboardEntryService leaderboardService;
    private final CompetitionService competitionService;

    private final SeriesMapper seriesMap;
    private final SeriesLeaderboardEntryMapper leaderboardEntryMap;

    private final PasswordEncoder passwordEncoder;

    public SeriesService(
            SeriesRepository seriesRepo,
            SeriesLeaderboardEntryService leaderboardService,
            CompetitionService competitionService,
            SeriesMapper seriesMap,
            SeriesLeaderboardEntryMapper leaderboardEntryMap,
            PasswordEncoder passwordEncoder
    ) {
        this.seriesRepo = seriesRepo;
        this.leaderboardService = leaderboardService;
        this.competitionService = competitionService;
        this.seriesMap = seriesMap;
        this.leaderboardEntryMap = leaderboardEntryMap;
        this.passwordEncoder = passwordEncoder;
    }

    public Series getById(Long id) {
        return seriesRepo.findById(id).orElse(null);
    }

    public Series getByUsername(String username) {
        return seriesRepo.findByUsername(username).orElse(null);
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
        if (seriesRepo.findByEmail(dto.email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        } else if (seriesRepo.findByUsername(dto.username).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already in use");
        }
        System.out.println("Registering series with email: " + dto.email);

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
                                                          CompetitorGroup group,
                                                          Gender division) {
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
    public void updateLeaderboardAfterCompetition(Long seriesId, CompetitorGroup group, Gender division) {
        leaderboardService.rebuildLeaderboard(seriesId, group, division);
    }

}

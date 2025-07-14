package com.cruxpass.services;

import com.cruxpass.dtos.CompetitionDto;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.repositories.CompetitionRepository;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CompetitionService {

    private final CompetitionRepository competitionRepository;

    public CompetitionService(CompetitionRepository competitionRepository) {
        this.competitionRepository = competitionRepository;
    }

    public List<Competition> getAllCompetitions() {
        return competitionRepository.findAll();
    }

    public Competition getById(Long id) {
        return competitionRepository.findById(id).orElse(null);
    }

    @Transactional
    public Competition createCompetition(CompetitionDto dto, Gym gym) {
        Competition competition = new Competition();
        competition.setName(dto.name());
        competition.setDate(dto.date());
        competition.setFormat(dto.format());
        competition.setTypes(dto.types());
        competition.setCompetitorGroups(dto.competitorGroups());

        competition.setGym(gym);

        return competitionRepository.save(competition);
    }
}
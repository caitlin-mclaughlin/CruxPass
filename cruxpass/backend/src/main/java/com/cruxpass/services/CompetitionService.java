package com.cruxpass.services;

import com.cruxpass.dtos.CompetitionDto;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.repositories.CompetitionRepository;
import com.cruxpass.repositories.RegistrationRepository;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CompetitionService {

    private final RegistrationRepository registrationRepository;

    private final CompetitionRepository competitionRepository;

    public CompetitionService(CompetitionRepository competitionRepository, RegistrationRepository registrationRepository) {
        this.competitionRepository = competitionRepository;
        this.registrationRepository = registrationRepository;
    }

    public List<Competition> getAllCompetitions() {
        return competitionRepository.findAll();
    }

    public Competition getById(Long id) {
        return competitionRepository.findById(id).orElse(null);
    }

    public Competition save(Competition competition) {
        return competitionRepository.save(competition);
    }

    @Transactional
    public Competition createCompetition(CompetitionDto dto, Gym gym) {
        Competition competition = new Competition();
        competition.setName(dto.name());
        competition.setDate(dto.date());
        competition.setDeadline(dto.deadline());
        competition.setCapacity(dto.capacity());
        competition.setFormat(dto.format());
        competition.setTypes(dto.types());
        competition.setCompetitorGroups(dto.competitorGroups());
        competition.setDivisions(dto.divisions());
        competition.setStatus(dto.status());

        competition.setGym(gym);

        return competitionRepository.save(competition);
    }
}
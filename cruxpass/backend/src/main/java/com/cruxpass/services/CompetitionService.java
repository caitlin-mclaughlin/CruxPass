package com.cruxpass.services;
import com.cruxpass.models.Competition;
import com.cruxpass.repositories.CompetitionRepository;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CompetitionService {

    private final CompetitionRepository competitionRepository;

    public CompetitionService(CompetitionRepository competitionRepository) {
        this.competitionRepository = competitionRepository;
    }

    public List<Competition> getAll() {
        return competitionRepository.findAll();
    }

    public Optional<Competition> getById(Long id) {
        return competitionRepository.findById(id);
    }

    public Competition getByIdWithRegistrations(Long id) {
        return competitionRepository.findByIdWithRegistrations(id).orElse(null);
    }

    @Transactional
    public Competition save(Competition competition) {
        return competitionRepository.save(competition);
    }
}
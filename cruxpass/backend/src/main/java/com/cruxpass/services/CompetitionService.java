package com.cruxpass.services;
import com.cruxpass.models.Competition;
import com.cruxpass.repositories.CompetitionRepository;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CompetitionService {

    private final CompetitionRepository competitionRepo;

    public CompetitionService(CompetitionRepository competitionRepo) {
        this.competitionRepo = competitionRepo;
    }

    public List<Competition> getByGymId(Long gymId) {
        return competitionRepo.findByGymId(gymId);
    }
    
    public List<Competition> getAll() {
        return competitionRepo.findAll();
    }

    public Optional<Competition> getById(Long id) {
        return competitionRepo.findById(id);
    }

    public Competition getByIdWithRegistrations(Long id) {
        return competitionRepo.findByIdWithRegistrations(id).orElse(null);
    }

    @Transactional
    public Competition save(Competition competition) {
        return competitionRepo.save(competition);
    }
}
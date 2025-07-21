package com.cruxpass.services;

import com.cruxpass.models.Competition;
import com.cruxpass.models.Registration;
import com.cruxpass.models.Climber;
import com.cruxpass.repositories.RegistrationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RegistrationService {

    private final RegistrationRepository repository;

    public RegistrationService(RegistrationRepository repository) {
        this.repository = repository;
    }

    public List<Registration> getAll() {
        return repository.findAll();
    }

    public List<Registration> getByCompetition(Competition competition) {
        return repository.findByCompetition(competition);
    }

    public Registration getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Registration getByClimberAndCompetition(Climber climber, Competition competition) {
        return repository.findByClimberAndCompetition(climber, competition);
    }

    public boolean existsByClimberAndCompetition(Climber climber, Competition competition) {
        return repository.existsByClimberAndCompetition(climber, competition);
    }

    public Registration save(Registration reg) {
        return repository.save(reg);
    }
}
package com.cruxpass.services;

import com.cruxpass.models.Competition;
import com.cruxpass.models.Registration;
import com.cruxpass.models.Climber;
import com.cruxpass.repositories.RegistrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepo;

    public RegistrationService(RegistrationRepository registrationRepo) {
        this.registrationRepo = registrationRepo;
    }

    public List<Registration> getAll() {
        return registrationRepo.findAll();
    }

    public List<Registration> getByCompetition(Competition competition) {
        return registrationRepo.findByCompetition(competition);
    }

    public Registration getById(Long id) {
        return registrationRepo.findById(id).orElse(null);
    }

    public Registration getByClimberAndCompetition(Climber climber, Competition competition) {
        return registrationRepo.findByClimberAndCompetition(climber, competition).orElse(null);
    }

    public Registration getByClimberIdAndCompetitionId(Long climberId, Long competitionId) {
        return registrationRepo.findByClimberIdAndCompetitionId(climberId, competitionId).orElse(null);
    }

    public boolean existsByClimberAndCompetition(Climber climber, Competition competition) {
        return registrationRepo.existsByClimberAndCompetition(climber, competition);
    }

    public long countByCompetition(Competition competition) {
        return registrationRepo.countByCompetition(competition);
    }

    @Transactional
    public Registration save(Registration reg) {
        return registrationRepo.save(reg);
    }
}
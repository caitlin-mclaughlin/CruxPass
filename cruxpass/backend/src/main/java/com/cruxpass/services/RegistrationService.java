package com.cruxpass.services;

import com.cruxpass.models.Competition;
import com.cruxpass.models.Registration;
import com.cruxpass.models.User;
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

    public Registration getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public boolean existsByUserAndCompetition(User user, Competition competition) {
        return repository.existsByUserAndCompetition(user, competition);
    }

    public Registration save(Registration reg) {
        return repository.save(reg);
    }
}
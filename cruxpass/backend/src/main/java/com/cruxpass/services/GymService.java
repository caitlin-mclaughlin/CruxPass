package com.cruxpass.services;

import com.cruxpass.models.Gym;
import com.cruxpass.repositories.GymRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GymService {
    private final GymRepository repository;

    public GymService(GymRepository repository) {
        this.repository = repository;
    }

    public List<Gym> getAll() {
        return repository.findAll();
    }

    public Gym getById(Long id) {
        return repository.findById(id).orElse(null);
    }
}
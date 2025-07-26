package com.cruxpass.services;

import com.cruxpass.models.Climber;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Registration;
import com.cruxpass.models.Route;
import com.cruxpass.repositories.RouteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RouteService {
    private final RouteRepository repository;

    public RouteService(RouteRepository repository) {
        this.repository = repository;
    }

    public List<Route> getAll() {
        return repository.findAll();
    }

    public List<Route> getByCompetition(Competition competition) {
        return repository.findByCompetition(competition);
    }

    public Route getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public List<Route> getByGymAndCompetition(Gym gym, Competition competition) {
        return repository.findByGymAndCompetition(gym, competition);
    }

    public Route save(Route route) {
        return repository.save(route);
    }
}
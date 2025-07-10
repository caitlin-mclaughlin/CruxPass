package com.cruxpass.services;

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

    public Route getById(Long id) {
        return repository.findById(id).orElse(null);
    }
}
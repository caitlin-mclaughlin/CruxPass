package com.cruxpass.repositories;

import com.cruxpass.models.Route;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RouteRepository extends JpaRepository<Route, Long> {
    Optional<List<Route>> findByCompetitionId(Long competitionId);
    Optional<List<Route>> findByGymId(Long gymId);
    
}
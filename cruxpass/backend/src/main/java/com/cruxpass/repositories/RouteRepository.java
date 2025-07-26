package com.cruxpass.repositories;

import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Route;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RouteRepository extends JpaRepository<Route, Long> {
    List<Route> findByGymAndCompetition(Gym gym, Competition competition);
    List<Route> findByCompetition(Competition competition);
    List<Route> findByGym(Gym gym);
}
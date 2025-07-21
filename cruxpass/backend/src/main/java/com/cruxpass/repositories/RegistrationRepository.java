package com.cruxpass.repositories;

import com.cruxpass.models.Competition;
import com.cruxpass.models.Registration;
import com.cruxpass.models.Climber;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    boolean existsByClimberAndCompetition(Climber climber, Competition competition);
    Registration findByClimberAndCompetition(Climber climber, Competition competition);
    List<Registration> findByCompetition(Competition competition);
}
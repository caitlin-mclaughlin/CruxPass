package com.cruxpass.repositories;

import com.cruxpass.models.Competition;
import com.cruxpass.models.Registration;
import com.cruxpass.models.Climber;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;


public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    boolean existsByClimberAndCompetition(Climber climber, Competition competition);
    Optional<Registration> findByClimberAndCompetition(Climber climber, Competition competition);
    Optional<Registration> findByClimberIdAndCompetitionId(Long climberId, Long competitionId);
    List<Registration> findByCompetition(Competition competition);
    long countByCompetition(Competition competition);
}
package com.cruxpass.repositories;

import com.cruxpass.models.Submission;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    Optional<Submission> findByCompetitionIdAndClimberId(Long competiionId, Long climberId);
    Optional<List<Submission>> findByCompetitionId(Long id);
    Optional<List<Submission>> findByClimberId(Long id);

    @Query("""
      SELECT s FROM Submission s 
      JOIN FETCH s.routes 
      WHERE s.competition.id = :compId 
        AND s.climber.id = :climberId
    """)
    Optional<Submission> findByCompetitionIdAndClimberIdWithRoutes(
        @Param("compId") Long compId, 
        @Param("climberId") Long climberId
    );

}
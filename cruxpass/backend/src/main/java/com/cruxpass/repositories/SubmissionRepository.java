package com.cruxpass.repositories;

import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.Division;
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
        SELECT s 
        FROM Submission s
        LEFT JOIN FETCH s.climber
        LEFT JOIN FETCH s.routes r
        LEFT JOIN FETCH r.route
        WHERE s.competition.id = :competitionId
            AND s.competitorGroup = :group
            AND (:division IS NULL OR s.division = :division)
    """)
    Optional<List<Submission>> findByCompetitionIdAndGroupAndDivision(
            @Param("competitionId") Long competitionId,
            @Param("group") DefaultCompetitorGroup group,
            @Param("division") Division division);
        
    @Query("""
        SELECT s FROM Submission s
        LEFT JOIN FETCH s.routes sr
        LEFT JOIN FETCH sr.route r
        WHERE s.competition.id = :compId 
            AND s.climber.id = :climberId
    """)
    Optional<Submission> findByCompetitionIdAndClimberIdWithRoutes(
        @Param("compId") Long compId, 
        @Param("climberId") Long climberId
    );
}
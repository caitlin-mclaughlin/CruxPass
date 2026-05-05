package com.cruxpass.repositories;

import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.Division;
import com.cruxpass.enums.GroupRefType;
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
        SELECT DISTINCT s FROM Submission s
        LEFT JOIN FETCH s.routes sr
        LEFT JOIN FETCH sr.route r
        WHERE s.competition.id = :competitionId
    """)
    List<Submission> findAllByCompetitionIdWithRoutes(
        @Param("competitionId") Long competitionId
    );

    @Query("""
        SELECT s 
        FROM Submission s
        LEFT JOIN FETCH s.climber
        LEFT JOIN FETCH s.routes r
        LEFT JOIN FETCH r.route
        WHERE s.competition.id = :competitionId
            AND s.competitorGroupRef.type = :type
            AND (
                (:type = com.cruxpass.enums.GroupRefType.DEFAULT AND s.competitorGroupRef.defaultKey = :defaultGroup)
                OR (:type = com.cruxpass.enums.GroupRefType.CUSTOM AND s.competitorGroupRef.customGroupId = :customGroupId)
            )
            AND (:division IS NULL OR s.division = :division)
    """)
    Optional<List<Submission>> findByCompetitionIdAndGroupAndDivision(
            @Param("competitionId") Long competitionId,
            @Param("type") GroupRefType type,
            @Param("defaultGroup") DefaultCompetitorGroup defaultGroup,
            @Param("customGroupId") Long customGroupId,
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

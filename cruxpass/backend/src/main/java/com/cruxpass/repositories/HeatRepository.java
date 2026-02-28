package com.cruxpass.repositories;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.cruxpass.models.Heat;

public interface HeatRepository extends JpaRepository<Heat, Long> {
    @Query("""
        SELECT DISTINCT h FROM Heat h 
        LEFT JOIN FETCH h.groups
        LEFT JOIN FETCH h.competition c
        WHERE c.id = :competitionId
    """)
    List<Heat> findAllByCompetitionId(Long competitionId);
}
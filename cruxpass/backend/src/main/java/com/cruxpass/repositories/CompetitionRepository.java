package com.cruxpass.repositories;

import com.cruxpass.dtos.HeatGroupProjection;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Heat;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;


public interface CompetitionRepository extends JpaRepository<Competition, Long> {
    @Query("""
        SELECT DISTINCT c FROM Competition c 
        LEFT JOIN FETCH c.selectedGroups
        LEFT JOIN FETCH c.heats h
        LEFT JOIN FETCH h.groups
    """)
    List<Competition> findAllWithHeats();

    @Query("""
        SELECT DISTINCT c FROM Competition c 
        LEFT JOIN FETCH c.selectedGroups
        LEFT JOIN FETCH c.heats h
        LEFT JOIN FETCH h.groups
        WHERE c.gym.id = :gymId
    """)
    List<Competition> findByGymIdWithHeats(Long gymId);

    @Query("""
        SELECT DISTINCT c FROM Competition c 
        LEFT JOIN FETCH c.selectedGroups
        LEFT JOIN FETCH c.heats h
        LEFT JOIN FETCH h.groups
        WHERE c.id = :id
    """)
    Optional<Competition> findByIdWithHeats(@Param("id") Long id);
    
    // Fetch competition and selected groups only (no heats/groups)
    @Query("""
        SELECT DISTINCT c FROM Competition c
        LEFT JOIN FETCH c.selectedGroups
        WHERE c.id = :id
    """)
    Optional<Competition> findByIdWithSelectedGroups(@Param("id") Long id);

    // Fetch heats separately, preserving order
    @Query("""
        SELECT h FROM Heat h
        WHERE h.competition.id = :competitionId
        ORDER BY h.startTime ASC
    """)
    List<Heat> findHeatsByCompetitionId(@Param("competitionId") Long competitionId);

    // Fetch groups for a list of heats
    @Query("""
        SELECT new com.cruxpass.dtos.HeatGroupProjection(h.id, g) 
        FROM Heat h
        JOIN h.groups g
        WHERE h.id IN :heatIds
    """)
    List<HeatGroupProjection> findGroupsByHeatIds(@Param("heatIds") List<Long> heatIds);

    List<Competition> findByGymId(Long gymId);
    
    @Query("SELECT c FROM Competition c JOIN FETCH c.gym WHERE c.id = :id AND c.gym.id = :gymId")
    Optional<Competition> findByIdAndGymId(@Param("id") Long id, @Param("gymId") Long gymId);

    @Query("SELECT c FROM Competition c LEFT JOIN FETCH c.registrations WHERE c.id = :id")
    Optional<Competition> findByIdWithRegistrations(@Param("id") Long id);
}
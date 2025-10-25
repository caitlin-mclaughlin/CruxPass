package com.cruxpass.repositories;

import com.cruxpass.models.Competition;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;


public interface CompetitionRepository extends JpaRepository<Competition, Long> {
    List<Competition> findByGymId(Long gymId);
    
    @Query("SELECT c FROM Competition c JOIN FETCH c.gym WHERE c.id = :id AND c.gym.id = :gymId")
    Optional<Competition> findByIdAndGymId(@Param("id") Long id, @Param("gymId") Long gymId);

    @Query("SELECT c FROM Competition c LEFT JOIN FETCH c.registrations WHERE c.id = :id")
    Optional<Competition> findByIdWithRegistrations(@Param("id") Long id);
}
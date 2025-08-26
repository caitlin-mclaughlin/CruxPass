package com.cruxpass.repositories;

import com.cruxpass.models.Competition;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CompetitionRepository extends JpaRepository<Competition, Long> {
    @Query("SELECT c FROM Competition c LEFT JOIN FETCH c.registrations WHERE c.id = :id")
    Optional<Competition> findByIdWithRegistrations(@Param("id") Long id);
}
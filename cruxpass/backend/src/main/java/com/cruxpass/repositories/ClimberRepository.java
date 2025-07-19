package com.cruxpass.repositories;

import com.cruxpass.models.Climber;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ClimberRepository extends JpaRepository<Climber, Long> {
    Optional<Climber> findByEmail(String email);
    Optional<Climber> findByUsername(String username);
}

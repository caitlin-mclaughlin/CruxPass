package com.cruxpass.repositories;

import com.cruxpass.models.Gym;
import com.cruxpass.models.User;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GymRepository extends JpaRepository<Gym, Long> {
    Optional<Gym> findByEmail(String email);
    Optional<Gym> findByUsername(String username);
}
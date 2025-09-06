package com.cruxpass.repositories;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cruxpass.models.Series;

@Repository
public interface SeriesRepository extends JpaRepository<Series, Long> {

    
    // Find active series by current date
    List<Series> findByStartDateBeforeAndEndDateAfter(LocalDate today);

    // Find series with registration still open
    List<Series> findByDeadlineAfter(LocalDateTime now);

    // Optional for lookups
    Optional<Series> findByName(String name);
    Optional<Series> findByUsername(String username);
    Optional<Series> findByEmail(String email);
}

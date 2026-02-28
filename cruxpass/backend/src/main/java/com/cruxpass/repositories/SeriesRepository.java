package com.cruxpass.repositories;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cruxpass.models.Series;

@Repository
public interface SeriesRepository extends JpaRepository<Series, Long> {
    Optional<Series> findByNameContainingIgnoreCaseAndActiveTrue(String name);
    Optional<Series> findByUsernameAndActiveTrue(String username);
    Optional<Series> findByEmailIgnoreCaseAndActiveTrue(String email);
    List<Series> findByGyms_IdAndActiveTrue(@Param("gymId") Long gymId);
    
    // Find live series by current date
    @Query("SELECT s FROM Series s WHERE s.startDate < :today AND s.endDate > :today")
    List<Series> findLiveSeries(@Param("today") LocalDate today);

    // Find series with registration still open
    List<Series> findByDeadlineAfter(LocalDateTime now);

    @Query("SELECT s FROM Series s LEFT JOIN FETCH s.gyms WHERE s.id = :id")
    Optional<Series> findByIdWithGyms(@Param("id") Long id);

    @Query("""
        SELECT s FROM Series s
        LEFT JOIN FETCH s.gyms
        LEFT JOIN FETCH s.competitions
        WHERE LOWER(s.email) = LOWER(:email)
        AND s.active = true
    """)
    Optional<Series> findByEmailIgnoreCaseAndActiveTrueWithGymsAndCompetitions(@Param("email") String email);

    @Query("""
        SELECT DISTINCT s FROM Series s
        WHERE s.active = true
        AND (
            (:email IS NULL OR LOWER(s.email) LIKE LOWER(CONCAT('%', :email, '%')))
            OR (:name IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%')))
        )
    """)
    List<Series> searchSeriesFlexible(
        @Param("email") String email,
        @Param("name") String name
    );
}

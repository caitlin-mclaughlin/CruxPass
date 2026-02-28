package com.cruxpass.repositories;

import com.cruxpass.models.Gym;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GymRepository extends JpaRepository<Gym, Long> {
    Optional<Gym> findByEmailIgnoreCaseAndActiveTrue(String email);
    Optional<Gym> findByUsernameAndActiveTrue(String username);
    List<Gym> findBySeriesIdAndActiveTrue(Long seriesId);

    @Query("SELECT g FROM Gym g LEFT JOIN FETCH g.series WHERE g.id = :id")
    Optional<Gym> findByIdWithSeries(@Param("id") Long id);

    @Query("""
        SELECT g FROM Gym g
        LEFT JOIN FETCH g.series
        WHERE LOWER(g.email) = LOWER(:email)
        AND g.active = true
    """)
    Optional<Gym> findByEmailIgnoreCaseAndActiveTrueWithSeries(@Param("email") String email);

    @Query("""
        SELECT DISTINCT g FROM Gym g
        WHERE g.active = true
        AND (
            (:email IS NULL OR LOWER(g.email) LIKE LOWER(CONCAT('%', :email, '%')))
            OR (:name IS NULL OR LOWER(g.name) LIKE LOWER(CONCAT('%', :name, '%')))
            OR (:phone IS NULL OR g.phone LIKE CONCAT('%', :phone, '%'))
        )
    """)
    List<Gym> searchGymsFlexible(
        @Param("email") String email,
        @Param("name") String name,
        @Param("phone") String phone
    );

    @Query("""
        SELECT g FROM Gym g
        WHERE g.active = false
          AND (g.competitions IS EMPTY OR g.competitions IS NULL)
          AND (g.series IS EMPTY OR g.series IS NULL)
    """)
    List<Gym> findFullyInactiveGyms();
}
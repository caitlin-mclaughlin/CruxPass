package com.cruxpass.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cruxpass.enums.Division;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Series;
import com.cruxpass.models.SeriesRegistration;

@Repository
public interface SeriesRegistrationRepository extends JpaRepository<SeriesRegistration, Long> {

    // Find all registrations for a given series
    List<SeriesRegistration> findBySeries(Series series);

    // Find all registrations for a climber
    List<SeriesRegistration> findByClimber(Climber climber);

    // Check if climber already registered
    Optional<SeriesRegistration> findByClimberAndSeries(Climber climber, Series series);

    // Support filtering by group/division
    List<SeriesRegistration> findBySeriesIdAndDivision(
        Long seriesId,
        Division division
    );
}

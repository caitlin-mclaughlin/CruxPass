package com.cruxpass.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cruxpass.enums.CompetitorGroup;
import com.cruxpass.enums.Gender;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Series;
import com.cruxpass.models.SeriesRegistration;

@Repository
public interface SeriesRegistrationRepository extends JpaRepository<SeriesRegistration, Long> {

    // Find all registrations for a given series
    List<SeriesRegistration> findAllBySeries(Series series);

    // Find all registrations for a climber
    List<SeriesRegistration> findAllByClimber(Climber climber);

    // Check if climber already registered
    Optional<SeriesRegistration> findBySeriesAndClimber(Series series, Climber climber);

    // Support filtering by group/division
    List<SeriesRegistration> findBySeriesIdAndCompetitorGroupAndDivision(
        Long seriesId,
        CompetitorGroup group,
        Gender division
    );
}

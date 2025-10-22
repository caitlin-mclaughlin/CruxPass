package com.cruxpass.services;

import com.cruxpass.models.Series;
import com.cruxpass.models.SeriesRegistration;
import com.cruxpass.models.Climber;
import com.cruxpass.repositories.SeriesRegistrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SeriesRegistrationService {

    private final SeriesRegistrationRepository seriesRegRepo;

    public SeriesRegistrationService(SeriesRegistrationRepository seriesRegRepo) {
        this.seriesRegRepo = seriesRegRepo;
    }

    public List<SeriesRegistration> getAll() {
        return seriesRegRepo.findAll();
    }

    public List<SeriesRegistration> getBySeries(Series series) {
        return seriesRegRepo.findBySeries(series);
    }

    public SeriesRegistration getById(Long id) {
        return seriesRegRepo.findById(id).orElse(null);
    }

    public SeriesRegistration getByClimberAndSeries(Climber climber, Series series) {
        return seriesRegRepo.findByClimberAndSeries(climber, series).orElse(null);
    }

    @Transactional
    public SeriesRegistration save(SeriesRegistration reg) {
        return seriesRegRepo.save(reg);
    }
}
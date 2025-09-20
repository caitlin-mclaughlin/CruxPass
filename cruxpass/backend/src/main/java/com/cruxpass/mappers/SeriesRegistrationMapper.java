package com.cruxpass.mappers;

import com.cruxpass.dtos.SeriesRegistrationDto;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Series;
import com.cruxpass.models.SeriesRegistration;

import org.springframework.stereotype.Component;

@Component
public class SeriesRegistrationMapper {

    public SeriesRegistrationDto toDto(SeriesRegistration reg) {
        return new SeriesRegistrationDto(
            reg.getSeries().getId(),
            reg.getClimber().getId(),
            reg.getCompetitorGroup(),
            reg.getDivision()
        );
    }

    public SeriesRegistration toEntity(SeriesRegistrationDto dto, Series series, Climber climber) {
        SeriesRegistration seriesReg = new SeriesRegistration();
        seriesReg.setSeries(series);
        seriesReg.setClimber(climber);
        seriesReg.setCompetitorGroup(dto.competitorGroup());
        seriesReg.setDivision(dto.division());
        return seriesReg;
    }

}

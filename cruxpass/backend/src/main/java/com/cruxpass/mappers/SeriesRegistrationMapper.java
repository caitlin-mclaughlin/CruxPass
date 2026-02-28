package com.cruxpass.mappers;

import com.cruxpass.dtos.SeriesRegistrationDto;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Series;
import com.cruxpass.models.SeriesRegistration;

import org.springframework.stereotype.Component;

@Component
public class SeriesRegistrationMapper {

    public SeriesRegistrationDto toDto(SeriesRegistration reg) {
        if (reg == null) return null;
        return new SeriesRegistrationDto(
            reg.getSeries().getId(),
            reg.getClimber().getId(),
            reg.getClimber().getName(),
            reg.getClimber().getDob().getYear(),
            reg.getDivision()
        );
    }

    public SeriesRegistration toEntity(SeriesRegistrationDto dto, Series series, Climber climber) {
        if (dto == null || series == null || climber == null) return null;
        SeriesRegistration seriesReg = new SeriesRegistration();
        seriesReg.setSeries(series);
        seriesReg.setClimber(climber);
        seriesReg.setDivision(dto.division());
        return seriesReg;
    }

}

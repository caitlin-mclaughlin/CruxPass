package com.cruxpass.mappers;

import com.cruxpass.models.Climber;
import com.cruxpass.dtos.requests.UpdateClimberRequestDto;
import com.cruxpass.dtos.responses.ClimberResponseDto;

import org.springframework.stereotype.Component;

import com.cruxpass.dtos.AddressDto;

@Component
public class ClimberMapper {

    public ClimberResponseDto toDto(Climber climber) {
        if (climber == null) return null;

        return new ClimberResponseDto(
            climber.getId(),
            climber.getName(),
            climber.getEmail(),
            climber.getPhone(),
            climber.getUsername(),
            climber.getDob(),
            climber.getDivision(),
            new AddressDto(climber.getAddress()),
            climber.getCreatedAt()
        );
    }

    public void updateEntityFromDto(UpdateClimberRequestDto dto, Climber climber) {
        if (dto == null || climber == null) return;

        climber.setName(dto.name());
        climber.setEmail(dto.email());
        climber.setPhone(dto.phone());
        climber.setUsername(dto.username());
        climber.setDob(dto.dob());
        climber.setDivision(dto.division());
        climber.setAddress(dto.address().toEntity());
    }
}

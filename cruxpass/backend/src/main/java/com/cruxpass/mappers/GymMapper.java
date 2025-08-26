package com.cruxpass.mappers;

import org.springframework.stereotype.Component;

import com.cruxpass.dtos.AddressDto;
import com.cruxpass.dtos.requests.UpdateGymRequestDto;
import com.cruxpass.dtos.responses.GymResponseDto;
import com.cruxpass.models.Gym;

@Component
public class GymMapper {

    public GymResponseDto toResponseDto(Gym gym) {
        return new GymResponseDto(
            gym.getId(),
            gym.getName(),
            gym.getEmail(),
            gym.getPhone(),
            gym.getUsername(),
            new AddressDto(gym.getAddress()),
            gym.getCreatedAt()
        );
    }

    public void updateGymFromDto(UpdateGymRequestDto dto, Gym gym) {
        gym.setName(dto.name());
        gym.setEmail(dto.email());
        gym.setPhone(dto.phone());
        gym.setUsername(dto.username());
        if (dto.address() != null) {
            gym.setAddress(dto.address().toEntity());
        }
    }
}

package com.cruxpass.mappers;

import com.cruxpass.dtos.AddressDto;
import com.cruxpass.dtos.requests.UpdateGymRequestDto;
import com.cruxpass.dtos.responses.GymResponseDto;
import com.cruxpass.dtos.responses.SimpleGymDto;
import com.cruxpass.models.Gym;

import org.springframework.stereotype.Component;

@Component
public class GymMapper {

    public GymResponseDto toResponseDto(Gym gym) {
        if (gym == null) return null;
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

    public SimpleGymDto toSimpleDto(Gym gym) {
        if (gym == null) return null;
        return new SimpleGymDto(
            gym.getId(),
            gym.getName(),
            gym.getEmail(),
            gym.getPhone(),
            new AddressDto(gym.getAddress())
        );
    }

    public void updateGymFromDto(UpdateGymRequestDto dto, Gym gym) {
        if (dto == null || gym == null) return;
        gym.setName(dto.name());
        gym.setEmail(dto.email());
        gym.setPhone(dto.phone());
        gym.setUsername(dto.username());
        if (dto.address() != null) {
            gym.setAddress(dto.address().toEntity());
        }
    }
}

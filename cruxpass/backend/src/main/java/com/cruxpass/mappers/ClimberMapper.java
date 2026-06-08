package com.cruxpass.mappers;

import com.cruxpass.dtos.ClimberLocationDto;
import com.cruxpass.dtos.UpdateClimberRequestDto;
import com.cruxpass.dtos.requests.ClimberRegisterRequest;
import com.cruxpass.dtos.requests.CreateDependentDto;
import com.cruxpass.dtos.responses.ClimberResponseDto;
import com.cruxpass.dtos.responses.DependentDto;
import com.cruxpass.dtos.responses.SimpleClimberDto;
import com.cruxpass.models.Climber;
import com.cruxpass.models.ClimberLocation;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

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
            climber.getGender(),
            new ClimberLocationDto(climber.getAddress()),
            climber.getCreatedAt(),
            climber.getEmergencyName(),
            climber.getEmergencyPhone()
        );
    }

    public DependentDto toDependentDto(Climber dependent) {
        if (dependent == null) return null;

        return new DependentDto(
            dependent.getId(),
            dependent.getName(),
            dependent.getDob(),
            dependent.getGender(),
            dependent.getCreatedAt(),
            dependent.getEmergencyName(),
            dependent.getEmergencyPhone()
        );
    }

    public SimpleClimberDto toSimpleDto(Climber climber) {
        if (climber == null) return null;
        return new SimpleClimberDto(
            climber.getId(),    
            climber.getName(),
            climber.getEmail(),
            climber.getPhone(),
            climber.getDob(),
            climber.getGender(),
            new ClimberLocationDto(climber.getAddress()),
            climber.getEmergencyName(),
            climber.getEmergencyPhone());
    }

    public SimpleClimberDto toSimpleDependentDto(Climber climber) {
        if (climber == null) return null;
        return SimpleClimberDto.dependent(
            climber.getId(),
            climber.getName(),
            climber.getDob(),
            climber.getGender(),
            climber.getEmergencyName(),
            climber.getEmergencyPhone());
    }

    public Climber toEntity(ClimberRegisterRequest dto, PasswordEncoder passwordEncoder) {
        if (dto == null) return null;
        Climber climber = new Climber();
        climber.setName(dto.name);
        climber.setUsername(dto.username);
        climber.setEmail(dto.email);
        climber.setPhone(dto.phone);
        climber.setDob(dto.dob);
        climber.setGender(dto.gender);
        climber.setPasswordHash(passwordEncoder.encode(dto.password));

        climber.setAddress(toClimberLocation(dto.address));
        climber.setEmergencyName(dto.emergencyName);
        climber.setEmergencyPhone(dto.emergencyPhone);
        return climber;
    }

    public Climber toDependentEntity(CreateDependentDto dto, Climber guardian) {
        if (dto == null || guardian == null) return null;
        Climber dependent = new Climber();
        dependent.setName(dto.name());
        dependent.setDob(dto.dob());
        dependent.setGender(dto.gender());
        dependent.setEmergencyName(dto.emergencyName());
        dependent.setEmergencyPhone(dto.emergencyPhone());
        return dependent;
    }

    public void updateEntityFromDto(UpdateClimberRequestDto dto, Climber climber) {
        if (dto == null || climber == null) return;

        if(hasText(dto.name())) climber.setName(dto.name());
        if(hasText(dto.email())) climber.setEmail(dto.email());
        if(hasText(dto.phone())) climber.setPhone(dto.phone());
        if(hasText(dto.username())) climber.setUsername(dto.username());
        if(dto.dob() != null) climber.setDob(dto.dob());
        if(dto.gender() != null) climber.setGender(dto.gender());
        if(dto.address() != null) climber.setAddress(toClimberLocation(dto.address()));
        if(hasText(dto.emergencyName())) climber.setEmergencyName(dto.emergencyName());
        if(hasText(dto.emergencyPhone())) climber.setEmergencyPhone(dto.emergencyPhone());
    }

    private ClimberLocation toClimberLocation(ClimberLocationDto dto) {
        if (dto == null) return null;

        return normalizeLocation(dto.city(), dto.state(), dto.zipCode());
    }

    private ClimberLocation normalizeLocation(String city, String state, String zipCode) {
        return new ClimberLocation(
            city == null ? "" : city,
            state == null ? "" : state,
            zipCode == null ? "" : zipCode
        );
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}

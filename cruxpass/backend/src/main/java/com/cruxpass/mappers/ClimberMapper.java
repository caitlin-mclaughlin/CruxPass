package com.cruxpass.mappers;

import com.cruxpass.models.Address;
import com.cruxpass.models.Climber;
import com.cruxpass.dtos.requests.CreateDependentDto;
import com.cruxpass.dtos.requests.RegisterRequest;
import com.cruxpass.dtos.responses.DependentDto;
import com.cruxpass.dtos.responses.SimpleClimberDto;
import com.cruxpass.dtos.responses.ClimberResponseDto;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.cruxpass.dtos.AddressDto;
import com.cruxpass.dtos.UpdateClimberRequestDto;

@Component
public class ClimberMapper {
    private static final String DEFAULT_CLIMBER_STREET = "N/A";
    private static final String DEFAULT_CLIMBER_ZIP = "00000";

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
            new AddressDto(climber.getAddress()),
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
            new AddressDto(climber.getAddress()),
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

    public Climber toEntity(RegisterRequest dto, PasswordEncoder passwordEncoder) {
        if (dto == null) return null;
        Climber climber = new Climber();
        climber.setName(dto.name);
        climber.setUsername(dto.username);
        climber.setEmail(dto.email);
        climber.setPhone(dto.phone);
        climber.setDob(dto.dob);
        climber.setGender(dto.gender);
        climber.setPasswordHash(passwordEncoder.encode(dto.password));

        climber.setAddress(toClimberAddress(dto.address));
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

        if(!dto.name().isBlank()) climber.setName(dto.name());
        if(!dto.email().isBlank()) climber.setEmail(dto.email());
        if(!dto.phone().isBlank()) climber.setPhone(dto.phone());
        if(!dto.username().isBlank()) climber.setUsername(dto.username());
        if(dto.dob() != null) climber.setDob(dto.dob());
        if(dto.gender() != null) climber.setGender(dto.gender());
        if(dto.address() != null) climber.setAddress(toClimberAddress(dto.address()));
        if(!dto.emergencyName().isBlank()) climber.setEmergencyName(dto.emergencyName());
        if(!dto.emergencyPhone().isBlank()) climber.setEmergencyPhone(dto.emergencyPhone());
    }

    private Address toClimberAddress(AddressDto dto) {
        if (dto == null) return null;

        final String city = dto.city() == null ? "" : dto.city();
        final String state = dto.state() == null ? "" : dto.state();
        final String street = (dto.streetAddress() == null || dto.streetAddress().isBlank())
            ? DEFAULT_CLIMBER_STREET
            : dto.streetAddress();
        final String zip = (dto.zipCode() == null || dto.zipCode().isBlank())
            ? DEFAULT_CLIMBER_ZIP
            : dto.zipCode();
        final String apartment = dto.apartmentNumber() == null ? "" : dto.apartmentNumber();

        return new Address(street, apartment, city, state, zip);
    }
}

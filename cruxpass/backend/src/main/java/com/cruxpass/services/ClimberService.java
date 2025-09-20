package com.cruxpass.services;

import com.cruxpass.dtos.requests.RegisterRequest;
import com.cruxpass.models.Address;
import com.cruxpass.models.Climber;
import com.cruxpass.repositories.ClimberRepository;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ClimberService {

    private final ClimberRepository climberRepo;
    private final PasswordEncoder passwordEncoder;

    public ClimberService(ClimberRepository climberRepo, PasswordEncoder passwordEncoder) {
        this.climberRepo = climberRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Climber createUser(RegisterRequest dto) {
        if (climberRepo.findByEmail(dto.email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        } else if (climberRepo.findByUsername(dto.username).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already in use");
        }

        System.out.println("Registering climber with email: " + dto.email);

        Climber climber = new Climber();
        climber.setName(dto.name);
        climber.setUsername(dto.username); // Or generate from name?
        climber.setEmail(dto.email);
        climber.setPhone(dto.phone);
        climber.setDob(dto.dob);
        climber.setDivision(dto.division);
        climber.setPasswordHash(passwordEncoder.encode(dto.password));

        Address addr = new Address(
            dto.address.streetAddress(),
            dto.address.apartmentNumber(),
            dto.address.city(),
            dto.address.state(),
            dto.address.zipCode()
        );
        climber.setAddress(addr);

        return climberRepo.save(climber);
    }

    @Transactional
    public Climber save(Climber climber) {
        return climberRepo.save(climber);
    }

    public List<Climber> getAll() {
        return climberRepo.findAll();
    }

    public Climber getById(Long id) {
        return climberRepo.findById(id).orElse(null);
    }

    public Climber getByEmail(String email) {
        System.out.println("Looking for gym with email: " + email);
        if (email == null) return null;
        return climberRepo.findByEmail(email).orElse(null);
    }

    public Climber getByUsername(String username) {
        return climberRepo.findByUsername(username).orElse(null);
    }
    
    public Climber getByEmailOrUsername(String id) {
        return (climberRepo.findByEmail(id).or(() -> climberRepo.findByUsername(id))).orElse(null);
    }

    public boolean passwordMatches(Climber climber, String rawPassword) {
        return passwordEncoder.matches(rawPassword, climber.getPasswordHash());
    }
    
}

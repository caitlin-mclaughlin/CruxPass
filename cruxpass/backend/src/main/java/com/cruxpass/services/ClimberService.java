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

    private final ClimberRepository repository;
    private final PasswordEncoder passwordEncoder;

    public ClimberService(ClimberRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Climber createUser(RegisterRequest dto) {
        if (repository.findByEmail(dto.email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        } else if (repository.findByUsername(dto.username).isPresent()) {
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

        return repository.save(climber);
    }

    @Transactional
    public Climber save(Climber climber) {
        return repository.save(climber);
    }

    public List<Climber> getAll() {
        return repository.findAll();
    }

    public Climber getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Climber getByEmail(String email) {
        System.out.println("Looking for gym with email: " + email);
        if (email == null) return null;
        return repository.findByEmail(email).orElse(null);
    }

    public Climber getByUsername(String username) {
        return repository.findByUsername(username).orElse(null);
    }
    
    public Climber getByEmailOrUsername(String id) {
        return (repository.findByEmail(id).or(() -> repository.findByUsername(id))).orElse(null);
    }

    public boolean passwordMatches(Climber climber, String rawPassword) {
        return passwordEncoder.matches(rawPassword, climber.getPasswordHash());
    }
    
}

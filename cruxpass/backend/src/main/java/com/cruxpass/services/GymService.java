package com.cruxpass.services;

import com.cruxpass.dtos.RegisterRequest;
import com.cruxpass.models.Address;
import com.cruxpass.models.Gym;
import com.cruxpass.repositories.GymRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class GymService {
    private final GymRepository repository;
    private final PasswordEncoder passwordEncoder;

    public GymService(GymRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public void createGym(RegisterRequest dto) {
        if (repository.findByEmail(dto.email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        } else if (repository.findByUsername(dto.username).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already in use");
        }
        
        Gym gym = new Gym();
        gym.setName(dto.name);
        gym.setUsername(dto.username); // Or use a custom field if desired
        gym.setEmail(dto.email);
        gym.setPhone(dto.phone);
        gym.setPasswordHash(passwordEncoder.encode(dto.password));

        Address addr = new Address(
            dto.address.streetAddress(),
            dto.address.apartmentNumber(),
            dto.address.city(),
            dto.address.state(),
            dto.address.zipCode()
        );
        gym.setAddress(addr);

        repository.save(gym);
    }

    public List<Gym> getAll() {
        return repository.findAll();
    }

    public Gym getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Gym getByEmail(String email) {
        return repository.findByEmail(email).orElse(null);
    }

    public Gym getByUsername(String username) {
        return repository.findByUsername(username).orElse(null);
    }

    public Gym getByEmailOrUsername(String id) {
        return (repository.findByEmail(id).or(() -> repository.findByUsername(id))).orElse(null);
    }

    public boolean passwordMatches(Gym gym, String rawPassword) {
        return passwordEncoder.matches(rawPassword, gym.getPasswordHash());
    }
}
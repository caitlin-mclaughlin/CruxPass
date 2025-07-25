package com.cruxpass.services;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.cruxpass.dtos.requests.RegisterRequest;
import com.cruxpass.models.Address;
import com.cruxpass.models.Gym;
import com.cruxpass.repositories.GymRepository;

@Service
public class GymService {
    private final GymRepository repository;
    private final PasswordEncoder passwordEncoder;

    public GymService(GymRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public Gym createGym(RegisterRequest dto) {
        if (repository.findByEmail(dto.email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        } else if (repository.findByUsername(dto.username).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already in use");
        }
        System.out.println("Registering gym with email: " + dto.email);

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

        return repository.save(gym);
    }

    public Gym save(Gym gym) {
        return repository.save(gym);
    }

    public List<Gym> getAll() {
        return repository.findAll();
    }

    public Gym getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Gym getByEmail(String email) {
        System.out.println("Looking for gym with email: " + email);
        if (email == null) return null;
        return repository.findByEmail(email.trim().toLowerCase()).orElse(null);
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
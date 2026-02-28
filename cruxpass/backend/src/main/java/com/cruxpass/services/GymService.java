package com.cruxpass.services;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.cruxpass.dtos.requests.RegisterRequest;
import com.cruxpass.models.Address;
import com.cruxpass.models.Gym;
import com.cruxpass.repositories.GymRepository;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class GymService {

    private final GymRepository gymRepo;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Gym createGym(RegisterRequest dto) {
        if (gymRepo.findByEmailIgnoreCaseAndActiveTrue(dto.email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        } else if (gymRepo.findByUsernameAndActiveTrue(dto.username).isPresent()) {
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

        return gymRepo.save(gym);
    }

    @Transactional
    public Gym save(Gym gym) {
        return gymRepo.save(gym);
    }

    public List<Gym> getAll() {
        return gymRepo.findAll();
    }

    public Gym getById(Long id) {
        return gymRepo.findById(id).orElse(null);
    }

    public Gym getByIdWithSeries(Long id) {
        return gymRepo.findByIdWithSeries(id).orElse(null);
    }

    public Gym getByEmail(String email) {
        if (email == null) return null;
        return gymRepo.findByEmailIgnoreCaseAndActiveTrue(email.trim().toLowerCase()).orElse(null);
    }

    public Gym getByUsername(String username) {
        return gymRepo.findByUsernameAndActiveTrue(username).orElse(null);
    }

    public Gym getByEmailOrUsername(String id) {
        return (gymRepo.findByEmailIgnoreCaseAndActiveTrue(id).or(() -> gymRepo.findByUsernameAndActiveTrue(id))).orElse(null);
    }

    public boolean passwordMatches(Gym gym, String rawPassword) {
        return passwordEncoder.matches(rawPassword, gym.getPasswordHash());
    }

    @Transactional
    public void deactivateGym(Long gymId) {
        Gym gym = gymRepo.findById(gymId)
            .orElseThrow(() -> new RuntimeException("Gym not found"));

        gym.setActive(false);
        gymRepo.save(gym);
    }

    public List<Gym> searchGyms(String email, String name, String phone) {
        if ((email == null || email.isBlank()) &&
            (name == null || name.isBlank()) &&
            (phone == null || phone.isBlank())) {
            return List.of();
        }

        return gymRepo.searchGymsFlexible(email, name, phone);
    }

}
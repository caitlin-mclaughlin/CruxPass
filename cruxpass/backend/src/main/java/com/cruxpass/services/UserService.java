package com.cruxpass.services;

import com.cruxpass.dtos.RegisterRequest;
import com.cruxpass.models.Address;
import com.cruxpass.models.User;
import com.cruxpass.repositories.UserRepository;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public void createUser(RegisterRequest dto) {
        if (repository.findByEmail(dto.email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        } else if (repository.findByUsername(dto.username).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already in use");
        }

        User user = new User();
        user.setName(dto.name);
        user.setUsername(dto.username); // Or generate from name?
        user.setEmail(dto.email);
        user.setPhone(dto.phone);
        user.setDob(dto.dob);
        user.setPasswordHash(passwordEncoder.encode(dto.password));

        Address addr = new Address(
            dto.address.streetAddress(),
            dto.address.apartmentNumber(),
            dto.address.city(),
            dto.address.state(),
            dto.address.zipCode()
        );
        user.setAddress(addr);

        repository.save(user);
    }

    public List<User> getAll() {
        return repository.findAll();
    }

    public User getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public User getByEmail(String email) {
        return repository.findByEmail(email).orElse(null);
    }

    public User getByUsername(String username) {
        return repository.findByUsername(username).orElse(null);
    }
    
    public User getByEmailOrUsername(String id) {
        return (repository.findByEmail(id).or(() -> repository.findByUsername(id))).orElse(null);
    }

    public boolean passwordMatches(User user, String rawPassword) {
        return passwordEncoder.matches(rawPassword, user.getPasswordHash());
    }
    
}

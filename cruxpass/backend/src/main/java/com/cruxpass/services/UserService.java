package com.cruxpass.services;

import com.cruxpass.dtos.RegisterRequest;
import com.cruxpass.models.User;
import com.cruxpass.repositories.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public User createUser(RegisterRequest dto) {
        User user = new User();
        user.setEmail(dto.email);
        user.setName(dto.name);
        user.setRegion(dto.region);
        user.setPasswordHash(passwordEncoder.encode(dto.password));
        return userRepo.save(user);
    }

    public User getByEmail(String email) {
        return userRepo.findByEmail(email).orElse(null);
    }
}

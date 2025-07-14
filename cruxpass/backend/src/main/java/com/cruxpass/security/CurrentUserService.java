package com.cruxpass.security;

import com.cruxpass.models.User;
import com.cruxpass.repositories.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepo;

    public CurrentUserService(JwtUtil jwtUtil, UserRepository userRepo) {
        this.jwtUtil = jwtUtil;
        this.userRepo = userRepo;
    }

    public User getUserFromToken(String authHeader) {
        return userRepo.findByEmail(extractEmail(authHeader)).orElse(null);
    }

    public String extractEmail(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("Auth header missing or invalid: " + authHeader);
            return null;
        }

        String token = authHeader.substring(7); // remove "Bearer "
        if (!jwtUtil.validateToken(token)) {
            System.out.println("Invalid token: " + token);
            return null;
        }

        String email = jwtUtil.extractEmail(token);
        System.out.println("Extracted email from auth header: " + email);
        return email;
    }
}


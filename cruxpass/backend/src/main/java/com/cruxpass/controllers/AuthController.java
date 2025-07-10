package com.cruxpass.controllers;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.cruxpass.dtos.AuthRequest;
import com.cruxpass.dtos.AuthResponse;
import com.cruxpass.dtos.RegisterRequest;
import com.cruxpass.security.JwtUtil;
import com.cruxpass.services.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;

    public AuthController(UserService userService, JwtUtil jwtUtil, AuthenticationManager authManager) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.authManager = authManager;
    }

    @PostMapping("/signup")
    public AuthResponse signup(@RequestBody RegisterRequest dto) {
        userService.createUser(dto);
        String token = jwtUtil.generateToken(dto.email);
        return new AuthResponse(token);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest dto) {
        Authentication auth = new UsernamePasswordAuthenticationToken(dto.email, dto.password);
        authManager.authenticate(auth);  // will throw if invalid
        String token = jwtUtil.generateToken(dto.email);
        return new AuthResponse(token);
    }
}

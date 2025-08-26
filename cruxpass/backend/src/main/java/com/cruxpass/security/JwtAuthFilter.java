package com.cruxpass.security;

import com.cruxpass.models.Gym;
import com.cruxpass.enums.AccountType;
import com.cruxpass.models.Climber;
import com.cruxpass.repositories.GymRepository;
import com.cruxpass.repositories.ClimberRepository;

import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final ClimberRepository climberRepo;
    private final GymRepository gymRepo;

    public JwtAuthFilter(JwtUtil jwtUtil, ClimberRepository climberRepo, GymRepository gymRepo) {
        this.jwtUtil = jwtUtil;
        this.climberRepo = climberRepo;
        this.gymRepo = gymRepo;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            String email = jwtUtil.extractEmail(token);
            AccountType role = jwtUtil.extractRole(token);

            if (email != null && role != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                boolean valid = false;

                switch (role) {
                    case CLIMBER -> {
                        var climber = climberRepo.findByEmail(email).orElse(null);
                        valid = climber != null && jwtUtil.validateToken(token);
                    }
                    case GYM -> {
                        var gym = gymRepo.findByEmail(email).orElse(null);
                        valid = gym != null && jwtUtil.validateToken(token);
                    }
                }

                if (valid) {
                    var authority = new SimpleGrantedAuthority("ROLE_" + role.name());
                    var authToken = new UsernamePasswordAuthenticationToken(email, null, List.of(authority));
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Optionally log token parsing errors
            e.printStackTrace();
        }

        chain.doFilter(request, response);
    }
}

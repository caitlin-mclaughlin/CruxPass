package com.cruxpass.security;

import com.cruxpass.enums.AccountType;
import com.cruxpass.repositories.GymRepository;
import com.cruxpass.repositories.SeriesRepository;
import com.cruxpass.repositories.ClimberRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;

import org.springframework.lang.NonNull;
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
    private final SeriesRepository seriesRepo;

    public JwtAuthFilter(
        JwtUtil jwtUtil,
        ClimberRepository climberRepo,
        GymRepository gymRepo,
        SeriesRepository seriesRepo
    ) {
        this.jwtUtil = jwtUtil;
        this.climberRepo = climberRepo;
        this.gymRepo = gymRepo;
        this.seriesRepo = seriesRepo;
    }

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain chain
    ) throws ServletException, IOException {
    System.out.println("JwtAuthFilter intercepting: " + request.getRequestURI());
        
        final String authHeader = request.getHeader("Authorization");
        String token = jwtUtil.extractToken(authHeader);

        if (token == null) {
            chain.doFilter(request, response);
            return;
        }

        try {
            if (!jwtUtil.validateToken(token)) {
                chain.doFilter(request, response);
                return;
            }

            String email = jwtUtil.extractEmail(token);
            AccountType role = jwtUtil.extractRole(token);

            if (email != null && role != null &&
                SecurityContextHolder.getContext().getAuthentication() == null) {

                boolean valid = switch (role) {
                    case CLIMBER -> climberRepo.findByEmailIgnoreCaseAndActiveTrue(email).isPresent();
                    case GYM -> gymRepo.findByEmailIgnoreCaseAndActiveTrue(email).isPresent();
                    case SERIES -> seriesRepo.findByEmailIgnoreCaseAndActiveTrue(email).isPresent();
                };

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

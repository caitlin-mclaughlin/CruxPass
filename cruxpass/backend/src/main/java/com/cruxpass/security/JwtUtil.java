package com.cruxpass.security;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    private final Key key;
    private final long jwtExpirationMs = 86400000; // 1 day

    public JwtUtil(@Value("${jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.trim().getBytes());
    }

    public String generateToken(String subject, String role, Long id) {
        System.out.println("Creating JWT: email = " + subject + ", role = " + role + ", id = " + id);

        return Jwts.builder()
                .setSubject(subject)
                .claim("role", role)
                .claim("id", id)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }


    public String extractEmail(String token) {
        try {
            String email = getClaims(token).getSubject();
            System.out.println("Extracted email from token: " + email);
            return email;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public String extractRole(String token) {
        try {
            return getClaims(token).get("role", String.class);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public Long extractId(String token) {
        try {
            return getClaims(token).get("id", Long.class);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        var claims = Jwts.parserBuilder()
            .setSigningKey(getKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
        System.out.println("Decoded token claims: " + claims);
        return claims;
    }

    public Key getKey() {
        return this.key;
    }

}

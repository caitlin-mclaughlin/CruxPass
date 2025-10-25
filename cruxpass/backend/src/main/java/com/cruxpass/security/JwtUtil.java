package com.cruxpass.security;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.cruxpass.enums.AccountType;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    private final Key key;
    private final long jwtExpirationMs = 86400000; // 1 day

    public JwtUtil(
        @Value("${jwt.secret:}") String secret,
        @Value("${JWT_SECRET_FILE:}") String secretFilePath
    ) {
        String keyString = secret;
        if (keyString == null || keyString.isEmpty()) {
            try {
                keyString = Files.readString(Path.of(secretFilePath)).trim();
            } catch (IOException e) {
                throw new IllegalStateException("Failed to read JWT secret file", e);
            }
        }
        this.key = Keys.hmacShaKeyFor(keyString.getBytes());
    }

    public String generateToken(String subject, AccountType role, Long id) {
        System.out.println("Creating JWT: email = " + subject + ", role = " + role + ", id = " + id);

        return Jwts.builder()
                .setSubject(subject)
                .claim("role", role.name())
                .claim("id", id)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }


    public String extractEmail(String token) {
        try {
            return getClaims(token).getSubject();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public AccountType extractRole(String token) {
        try {
            String roleStr = getClaims(token).get("role", String.class);  // <-- read as String
            return roleStr != null ? AccountType.valueOf(roleStr) : null; 
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
        return claims;
    }

    public Key getKey() {
        return this.key;
    }

}

package com.cruxpass.dtos.requests;

public record AuthRequest(
    String emailOrUsername,
    String password
) {}

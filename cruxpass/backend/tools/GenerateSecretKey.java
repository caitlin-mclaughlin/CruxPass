package com.cruxpass.tools;

import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.io.FileWriter;
import java.io.IOException;
import java.security.Key;
import java.util.Base64;

public class GenerateSecretKey {
    public static void main(String[] args) {
        try {
            Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
            String encodedKey = Base64.getEncoder().encodeToString(key.getEncoded());

            try (FileWriter writer = new FileWriter(".env")) {  // overwrite file
                writer.write("JWT_SECRET=" + encodedKey + "\n");  // no quotes to avoid parsing issues
            }

            System.out.println("JWT_SECRET written to .env:");
            System.out.println(encodedKey);
        } catch (IOException e) {
            System.err.println("Could not write .env file: " + e.getMessage());
        }
    }
}

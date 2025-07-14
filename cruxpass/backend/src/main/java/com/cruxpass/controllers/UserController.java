package com.cruxpass.controllers;

import com.cruxpass.dtos.UserProfileDto;
import com.cruxpass.models.User;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final CurrentUserService currentUser;

    public UserController(UserService userService, CurrentUserService currentUser) {
        this.userService = userService;
        this.currentUser = currentUser;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserProfileDto> getMyUser(Authentication authentication) {
        String email = authentication.getName();  // Spring sets this to the username/email from token

        System.out.println("Looking for user with email: " + email);
        User user = userService.getByEmail(email);

        if (user == null) {
            return ResponseEntity.status(404).build();
        }

        var dto = new UserProfileDto(
            user.getName(),
            user.getEmail(),
            user.getPhone(),
            user.getAddress()
        );

        return ResponseEntity.ok(dto);
    }


    @GetMapping
    public List<User> getAll() {
        return userService.getAll();
    }

    @GetMapping("/{id}")
    public User getById(@PathVariable Long id) {
        return userService.getById(id);
    }
}
package com.cruxpass.controllers;

import com.cruxpass.models.Registration;
import com.cruxpass.services.RegistrationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {
    private final RegistrationService service;

    public RegistrationController(RegistrationService service) {
        this.service = service;
    }

    @GetMapping
    public List<Registration> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Registration getById(@PathVariable Long id) {
        return service.getById(id);
    }
}
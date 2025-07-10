package com.cruxpass.controllers;

import com.cruxpass.models.Gym;
import com.cruxpass.services.GymService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gyms")
public class GymController {
    private final GymService service;

    public GymController(GymService service) {
        this.service = service;
    }

    @GetMapping
    public List<Gym> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Gym getById(@PathVariable Long id) {
        return service.getById(id);
    }
}
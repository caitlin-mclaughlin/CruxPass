package com.cruxpass.controllers;

import com.cruxpass.models.Route;
import com.cruxpass.services.RouteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
public class RouteController {
    private final RouteService service;

    public RouteController(RouteService service) {
        this.service = service;
    }

    @GetMapping
    public List<Route> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Route getById(@PathVariable Long id) {
        return service.getById(id);
    }
}
package com.cruxpass.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@AllArgsConstructor
@Data
@Entity
@NoArgsConstructor
public class Competition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private LocalDate date;
    private String category;

    @ManyToOne
    private Gym gym;

    @OneToMany(mappedBy = "competition")
    private List<Route> routes;

    @OneToMany(mappedBy = "competition")
    private List<Registration> registrations;
}
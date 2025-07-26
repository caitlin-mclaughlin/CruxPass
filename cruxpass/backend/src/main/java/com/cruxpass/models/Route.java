package com.cruxpass.models;

import org.springframework.lang.NonNull;

import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Data
@Entity
@NoArgsConstructor
public class Route {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Positive
    private int number;
    @Positive
    private int pointValue;

    @ManyToOne
    @NonNull
    private Competition competition;

    @ManyToOne
    @NonNull
    private Gym gym;
}
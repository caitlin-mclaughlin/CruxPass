package com.cruxpass.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@AllArgsConstructor
@Data
@Entity
@NoArgsConstructor
public class Submission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @NonNull
    private Climber climber;

    @ManyToOne
    @NonNull
    private Competition competition;

    @JsonIgnore
    @OneToMany(cascade = CascadeType.ALL)
    private List<SubmittedRoute> routes;
}
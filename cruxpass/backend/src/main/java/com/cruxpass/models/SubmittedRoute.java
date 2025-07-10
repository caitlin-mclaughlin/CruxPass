package com.cruxpass.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Data
@Entity
@NoArgsConstructor
public class SubmittedRoute {

    @Id
    @GeneratedValue
    private Long id;

    private int attempts;

    @ManyToOne
    private Route route;
}

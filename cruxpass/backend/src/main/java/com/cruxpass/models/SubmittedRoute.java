package com.cruxpass.models;

import io.micrometer.common.lang.NonNull;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.Positive;
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

    @Positive
    private int attempts;

    @NonNull
    @ManyToOne
    private Route route;
}

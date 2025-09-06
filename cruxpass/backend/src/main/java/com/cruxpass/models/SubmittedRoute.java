package com.cruxpass.models;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
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

    private boolean send;

    @JoinColumn(name = "route_id", nullable = false)
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Route route;

    @JoinColumn(name = "submission_id", nullable = false)
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Submission submission;

}

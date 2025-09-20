package com.cruxpass.models;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.lang.NonNull;

import com.cruxpass.enums.CompetitionStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Data
@Entity
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor
public class Series {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;
    @NotBlank
    @Email
    private String email;
    @NotBlank
    private String username;
    @NotBlank
    private String passwordHash;

    private String description;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDateTime deadline;

    @Enumerated(EnumType.STRING)
    private CompetitionStatus seriesStatus;

    @Column(nullable = false, updatable = false)
    @CreatedDate
    private LocalDate createdAt;

    @JsonIgnore
    @NonNull
    @OneToMany(mappedBy = "series")
    private List<Competition> competitions;
}


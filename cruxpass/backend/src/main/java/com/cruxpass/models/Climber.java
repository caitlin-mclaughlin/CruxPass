package com.cruxpass.models;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.cruxpass.enums.Gender;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

@AllArgsConstructor
@Data
@Entity
@EntityListeners(AuditingEntityListener.class) 
@NoArgsConstructor
public class Climber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;
    @NotBlank
    @Email
    private String email;
    @NotBlank
    private String phone;
    @NonNull
    private LocalDate dob;
    @NotBlank
    private String username;
    @NotBlank
    private String passwordHash;
    @NonNull
    private Address address;

    @NonNull
    @Enumerated(EnumType.STRING)
    private Gender division;

    @Column(nullable = false, updatable = false)
    @CreatedDate
    private LocalDate createdAt;

    @JsonIgnore
    private String series;

    @JsonIgnore
    @OneToMany(mappedBy = "climber")
    private List<Registration> registrations;

    @JsonIgnore
    @OneToMany(mappedBy = "climber")
    private List<Submission> submissions;

}

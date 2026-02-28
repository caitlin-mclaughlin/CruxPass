package com.cruxpass.models;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.cruxpass.enums.Gender;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@EntityListeners(AuditingEntityListener.class)
public class Climber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @NonNull
    private LocalDate dob;

    @NonNull
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @NotBlank
    private String emergencyName;
    @NotBlank
    private String emergencyPhone;

    // Only required for account-holders
    private String email;
    private String phone;
    private String username;
    private String passwordHash;
    @Embedded
    private Address address;

    @Column(nullable = false, updatable = false)
    @CreatedDate
    private LocalDate createdAt;

    @Column(nullable = false)
    private boolean active = true;

    @JsonIgnore
    @ManyToMany
    @JoinTable(
        name = "dependent_guardians",
        joinColumns = @JoinColumn(name = "dependent_id"),
        inverseJoinColumns = @JoinColumn(name = "guardian_id")
    )
    private Set<Climber> guardians = new HashSet<>(); // Only for dependent climbers

    @JsonIgnore
    @ManyToMany(mappedBy = "guardians")
    private Set<Climber> dependents = new HashSet<>(); // Only for guardian climbers

    @JsonIgnore
    private String series;

    @JsonIgnore
    @OneToMany(mappedBy = "climber")
    private List<Registration> registrations = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "climber")
    private List<Submission> submissions = new ArrayList<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Climber)) return false;
        Climber other = (Climber) o;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}

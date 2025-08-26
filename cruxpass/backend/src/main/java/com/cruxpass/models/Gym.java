package com.cruxpass.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

import java.util.Date;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonIgnore;

@AllArgsConstructor
@Data
@Entity
@EntityListeners(AuditingEntityListener.class) 
@NoArgsConstructor
public class Gym {

    @Id
    @GeneratedValue
    private Long id;

    @NotBlank
    private String name;
    
    @Column(unique = true, nullable = false)
    private String email;
    @NotBlank
    private String phone;
    
@   Column(unique = true, nullable = false)
    private String username;
    @NotBlank
    private String passwordHash;
    @NonNull
    private Address address;

    @Column(nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    @CreatedDate
    private Date createdAt;

    @JsonIgnore
    @OneToMany(mappedBy = "gym")
    private List<Competition> competitions;
}

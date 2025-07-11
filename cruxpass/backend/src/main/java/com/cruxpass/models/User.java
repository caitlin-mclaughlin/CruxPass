package com.cruxpass.models;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Data
@Entity
@NoArgsConstructor
@Table(name = "app_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String username;
    private String email;
    private String phone;
    private LocalDate dob;
    private String passwordHash;
    private Address address;

    private String series;

    @OneToMany(mappedBy = "user")
    private List<Registration> registrations;

    @OneToMany(mappedBy = "user")
    private List<Submission> submissions;

}

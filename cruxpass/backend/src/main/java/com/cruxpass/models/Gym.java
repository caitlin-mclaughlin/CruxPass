package com.cruxpass.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.*;

@AllArgsConstructor
@Data
@Entity
@NoArgsConstructor
public class Gym {

    @Id
    @GeneratedValue
    private Long id;

    private String name;
    private String username;
    private String email;
    private String phone;
    private String passwordHash;
    private Address address;

    @OneToMany(mappedBy = "gym")
    private List<Competition> competitions;
}

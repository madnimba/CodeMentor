package com.codementor.domain;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "tracks")
public class Track {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;
} 
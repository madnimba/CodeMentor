package com.codementor.domain;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "subtopics")
public class Subtopic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(nullable = false)
    private String name;
} 
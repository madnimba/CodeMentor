package com.codementor.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

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

    @OneToMany(mappedBy = "subtopic", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Question> questions;
} 
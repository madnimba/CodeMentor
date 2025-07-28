package com.codementor.domain;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "testcases")
public class Testcase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    private Question question;

    @Column(name = "test1", columnDefinition = "TEXT")
    private String test1;

    @Column(name = "output1", columnDefinition = "TEXT")
    private String output1;

    @Column(name = "test2", columnDefinition = "TEXT")
    private String test2;

    @Column(name = "output2", columnDefinition = "TEXT")
    private String output2;

    @Column(name = "test3", columnDefinition = "TEXT")
    private String test3;

    @Column(name = "output3", columnDefinition = "TEXT")
    private String output3;
} 
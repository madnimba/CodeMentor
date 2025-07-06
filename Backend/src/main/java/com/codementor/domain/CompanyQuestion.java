package com.codementor.domain;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "companyquestions")
public class CompanyQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question question;

    @Column(name = "`year`")
    private Integer year;

    private String position;
}
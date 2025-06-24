package com.codementor.repository;

import com.codementor.domain.Subtopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubtopicRepository extends JpaRepository<Subtopic, Integer> {
    Optional<Subtopic> findByName(String name);
    boolean existsByName(String name);
    List<Subtopic> findByTopicId(Integer topicId);
    //List<Subtopic> findByTrackId(Integer trackId);
} 
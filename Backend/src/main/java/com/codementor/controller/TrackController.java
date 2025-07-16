package com.codementor.controller;

import com.codementor.domain.Track;
import com.codementor.dto.common.ApiResponse;
import com.codementor.exception.ResourceNotFoundException;
import com.codementor.repository.TrackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tracks")
@RequiredArgsConstructor
public class TrackController {
    private final TrackRepository trackRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Track>>> getAllTracks() {
        List<Track> tracks = trackRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(tracks));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Track>> getTrackById(@PathVariable Integer id) {
        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Track not found"));
        return ResponseEntity.ok(ApiResponse.success(track));
    }
} 
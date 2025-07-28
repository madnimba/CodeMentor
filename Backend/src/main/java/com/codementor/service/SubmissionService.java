package com.codementor.service;

import com.codementor.domain.*;
import com.codementor.dto.submission.CreateSubmissionRequest;
import com.codementor.dto.submission.SubmissionResponse;
import com.codementor.dto.submission.StreakStats;
import com.codementor.repository.*;
import com.codementor.exception.ResourceNotFoundException;
import com.codementor.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Transactional
    public SubmissionResponse saveSubmission(CreateSubmissionRequest request) {
        // Get current user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName(); // JWT token contains email, not username
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        // Get question
        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        // Create submission
        Submission submission = new Submission();
        submission.setUser(user);
        submission.setQuestion(question);
        submission.setCode(request.getCode());
        submission.setLanguage(request.getLanguage());
        submission.setStatus(request.getStatus());
        submission.setRuntime(request.getRuntime());
        submission.setMemory(request.getMemory());


        Submission savedSubmission = submissionRepository.save(submission);
        return convertToResponse(savedSubmission);
    }

    public SubmissionResponse getSubmissionById(Integer submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
        return convertToResponse(submission);
    }

    public List<SubmissionResponse> getSubmissionsByUser(Integer userId) {
        List<Submission> submissions = submissionRepository.findByUserIdOrderBySubmittedAtDesc(userId);
        return submissions.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<SubmissionResponse> getSubmissionsByQuestion(Integer questionId) {
        List<Submission> submissions = submissionRepository.findByQuestionIdOrderBySubmittedAtDesc(questionId);
        return submissions.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<SubmissionResponse> getUserSubmissionsForQuestion(Integer userId, Integer questionId) {
        List<Submission> submissions = submissionRepository.findByUserIdAndQuestionIdOrderBySubmittedAtDesc(userId, questionId);
        return submissions.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public Long getTotalQuestionsAttempted(Integer userId) {
        return submissionRepository.countUniqueQuestionsAttemptedByUser(userId);
    }
    
    public Long getTotalQuestionsSolved(Integer userId) {
        return submissionRepository.countUniqueQuestionsSolvedByUser(userId);
    }
    
    public Double getAccuracyRate(Integer userId) {
        Long totalSubmissions = submissionRepository.countTotalSubmissionsByUser(userId);
        Long acceptedSubmissions = submissionRepository.countAcceptedSubmissionsByUser(userId);
        
        if (totalSubmissions == 0) {
            return 0.0;
        }
        
        return Math.round((double) acceptedSubmissions / totalSubmissions * 100 * 100.0) / 100.0;
    }
    
    public StreakStats getStreakStats(Integer userId) {
        List<LocalDateTime> submissionTimestamps = submissionRepository.getSubmissionTimestampsByUser(userId);
        
        if (submissionTimestamps.isEmpty()) {
            return new StreakStats(0, 0);
        }
        
        // Convert timestamps to dates
        List<LocalDate> submissionDates = submissionTimestamps.stream()
                .map(LocalDateTime::toLocalDate)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        
        int currentStreak = calculateCurrentStreak(submissionDates);
        int longestStreak = calculateLongestStreak(submissionDates);
        
        return new StreakStats(currentStreak, longestStreak);
    }
    
    private int calculateCurrentStreak(List<LocalDate> dates) {
        if (dates.isEmpty()) return 0;
        
        LocalDate today = LocalDate.now();
        LocalDate lastSubmissionDate = dates.get(0);
        
        // If last submission was more than 1 day ago, streak is broken
        if (ChronoUnit.DAYS.between(lastSubmissionDate, today) > 1) {
            return 0;
        }
        
        int streak = 0;
        LocalDate currentDate = today;
        
        while (dates.contains(currentDate)) {
            streak++;
            currentDate = currentDate.minusDays(1);
        }
        
        return streak;
    }
    
    private int calculateLongestStreak(List<LocalDate> dates) {
        if (dates.isEmpty()) return 0;
        
        // Sort dates in ascending order for longest streak calculation
        List<LocalDate> sortedDates = dates.stream()
                .sorted()
                .collect(Collectors.toList());
        
        int maxStreak = 0;
        int currentStreak = 1;
        
        for (int i = 1; i < sortedDates.size(); i++) {
            LocalDate prev = sortedDates.get(i-1);
            LocalDate curr = sortedDates.get(i);
            
            if (ChronoUnit.DAYS.between(prev, curr) == 1) {
                // Consecutive days
                currentStreak++;
            } else {
                // Gap found, reset streak
                maxStreak = Math.max(maxStreak, currentStreak);
                currentStreak = 1;
            }
        }
        
        return Math.max(maxStreak, currentStreak);
    }

    private SubmissionResponse convertToResponse(Submission submission) {
        SubmissionResponse response = new SubmissionResponse();
        response.setId(submission.getId());
        response.setUserId(submission.getUser().getId());
        response.setUsername(submission.getUser().getUsername());
        response.setQuestionId(submission.getQuestion().getId());
        response.setQuestionTitle(submission.getQuestion().getTitle());
        response.setCode(submission.getCode());
        response.setLanguage(submission.getLanguage());
        response.setStatus(submission.getStatus());
        response.setRuntime(submission.getRuntime());
        response.setMemory(submission.getMemory());
        response.setSubmittedAt(submission.getSubmittedAt());

        return response;
    }
} 
package com.codementor.service;

import com.codementor.domain.CompletedQuestion;
import com.codementor.domain.Question;
import com.codementor.domain.User;
import com.codementor.dto.completedquestion.MarkQuestionCompletedRequest;
import com.codementor.exception.ResourceNotFoundException;
import com.codementor.exception.UnauthorizedException;
import com.codementor.repository.CompletedQuestionRepository;
import com.codementor.repository.QuestionRepository;
import com.codementor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompletedQuestionService {
    
    private final CompletedQuestionRepository completedQuestionRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;

    /**
     * Mark a question as completed by the current user
     * Only works for non-coding questions
     */
    @Transactional
    public void markQuestionCompleted(MarkQuestionCompletedRequest request) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        // Get the question
        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        // Check if it's a non-coding question
        if (question.getIsCoding()) {
            throw new IllegalArgumentException("Cannot mark coding questions as completed. Use the coding interface instead.");
        }

        // Check if user has already completed this question
        boolean alreadyCompleted = completedQuestionRepository.existsByUserIdAndQuestionId(user.getId(), request.getQuestionId());

        if (!alreadyCompleted) {
            // Create a new record
            CompletedQuestion completedQuestion = new CompletedQuestion();
            completedQuestion.setUser(user);
            completedQuestion.setQuestion(question);
            completedQuestionRepository.save(completedQuestion);
        }
    }

    /**
     * Check if user has completed a specific question
     */
    public boolean hasUserCompletedQuestion(Integer questionId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        return completedQuestionRepository.existsByUserIdAndQuestionId(user.getId(), questionId);
    }

    /**
     * Remove completion status for a question
     */
    @Transactional
    public void removeQuestionCompletion(Integer questionId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        completedQuestionRepository.findByUserIdAndQuestionId(user.getId(), questionId)
                .ifPresent(completedQuestionRepository::delete);
    }
} 
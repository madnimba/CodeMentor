package com.codementor.service;

import com.codementor.domain.Question;
import com.codementor.domain.Track;
import com.codementor.domain.Subtopic;
import com.codementor.domain.User;
import com.codementor.dto.question.CreateQuestionRequest;
import com.codementor.dto.question.QuestionResponse;
import com.codementor.dto.question.UpdateQuestionRequest;
import com.codementor.exception.ResourceNotFoundException;
import com.codementor.exception.UnauthorizedException;
import com.codementor.repository.QuestionRepository;
import com.codementor.repository.TrackRepository;
import com.codementor.repository.SubtopicRepository;
import com.codementor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class QuestionService {
    private final QuestionRepository questionRepository;
    private final TrackRepository trackRepository;
    private final SubtopicRepository subtopicRepository;
    private final UserRepository userRepository;

    @Transactional
    public QuestionResponse createQuestion(CreateQuestionRequest request) {
        User currentUser = getCurrentUser();
        
        // Validate track
        Track track = trackRepository.findById(request.getTrackId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found"));
        
        // Validate subtopic if provided
        Subtopic subtopic = null;
        if (request.getSubtopicId() != null) {
            subtopic = subtopicRepository.findById(request.getSubtopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subtopic not found"));
        }
        
        // Validate difficulty
        Question.Difficulty difficulty;
        try {
            difficulty = Question.Difficulty.valueOf(request.getDifficulty());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid difficulty level. Must be Easy, Medium, or Hard");
        }

        Question question = new Question();
        question.setTitle(request.getTitle());
        question.setSlug(generateSlug(request.getTitle()));
        question.setDescription(request.getDescription());
        question.setContentFingerprint(request.getContentFingerprint());
        question.setDifficulty(difficulty);
        question.setImportanceTag(request.getImportanceTag());
        question.setTrack(track);
        question.setSubtopic(subtopic);
        question.setCreatedBy(currentUser);
        question.setUpvotes(0);
        question.setDownvotes(0);

        Question savedQuestion = questionRepository.save(question);
        return mapToQuestionResponse(savedQuestion);
    }

    public QuestionResponse getQuestionById(Integer id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        return mapToQuestionResponse(question);
    }

    public QuestionResponse getQuestionBySlug(String slug) {
        Question question = questionRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        return mapToQuestionResponse(question);
    }

    public Page<QuestionResponse> getAllQuestions(Pageable pageable) {
        Page<Question> questions = questionRepository.findAll(pageable);
        return questions.map(this::mapToQuestionResponse);
    }

    public Page<QuestionResponse> getQuestionsByTrack(Integer trackId, Pageable pageable) {
        Page<Question> questions = questionRepository.findByTrackId(trackId, pageable);
        return questions.map(this::mapToQuestionResponse);
    }

    public Page<QuestionResponse> getQuestionsBySubtopic(Integer subtopicId, Pageable pageable) {
        Page<Question> questions = questionRepository.findBySubtopicId(subtopicId, pageable);
        return questions.map(this::mapToQuestionResponse);
    }

    public Page<QuestionResponse> getQuestionsByDifficulty(String difficulty, Pageable pageable) {
        Question.Difficulty difficultyEnum;
        try {
            difficultyEnum = Question.Difficulty.valueOf(difficulty);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid difficulty level. Must be Easy, Medium, or Hard");
        }
        
        Page<Question> questions = questionRepository.findByDifficulty(difficultyEnum, pageable);
        return questions.map(this::mapToQuestionResponse);
    }

    public Page<QuestionResponse> searchQuestionsByTitle(String title, Pageable pageable) {
        Page<Question> questions = questionRepository.findByTitleContainingIgnoreCase(title, pageable);
        return questions.map(this::mapToQuestionResponse);
    }

    public Page<QuestionResponse> getQuestionsByImportanceTag(String importanceTag, Pageable pageable) {
        Page<Question> questions = questionRepository.findByImportanceTag(importanceTag, pageable);
        return questions.map(this::mapToQuestionResponse);
    }

    public Page<QuestionResponse> getQuestionsByCreator(Integer creatorId, Pageable pageable) {
        Page<Question> questions = questionRepository.findByCreatedById(creatorId, pageable);
        return questions.map(this::mapToQuestionResponse);
    }

    public Page<QuestionResponse> getQuestionsWithMinUpvotes(Integer minUpvotes, Pageable pageable) {
        Page<Question> questions = questionRepository.findQuestionsWithMinUpvotes(minUpvotes, pageable);
        return questions.map(this::mapToQuestionResponse);
    }

    public Page<QuestionResponse> getQuestionsByTrackAndDifficulty(Integer trackId, String difficulty, Pageable pageable) {
        Question.Difficulty difficultyEnum;
        try {
            difficultyEnum = Question.Difficulty.valueOf(difficulty);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid difficulty level. Must be Easy, Medium, or Hard");
        }
        
        Page<Question> questions = questionRepository.findByTrackIdAndDifficulty(trackId, difficultyEnum, pageable);
        return questions.map(this::mapToQuestionResponse);
    }

    public boolean isContentFingerprintExists(String contentFingerprint) {
        return questionRepository.findByContentFingerprint(contentFingerprint).isPresent();
    }

    @Transactional
    public QuestionResponse updateQuestion(Integer id, UpdateQuestionRequest request) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        
        User currentUser = getCurrentUser();
        if (!question.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to update this question");
        }

        // Validate track
        Track track = trackRepository.findById(request.getTrackId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found"));
        
        // Validate subtopic if provided
        Subtopic subtopic = null;
        if (request.getSubtopicId() != null) {
            subtopic = subtopicRepository.findById(request.getSubtopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subtopic not found"));
        }
        
        // Validate difficulty
        Question.Difficulty difficulty;
        try {
            difficulty = Question.Difficulty.valueOf(request.getDifficulty());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid difficulty level. Must be Easy, Medium, or Hard");
        }

        question.setTitle(request.getTitle());
        question.setSlug(generateSlug(request.getTitle()));
        question.setDescription(request.getDescription());
        question.setContentFingerprint(request.getContentFingerprint());
        question.setDifficulty(difficulty);
        question.setImportanceTag(request.getImportanceTag());
        question.setTrack(track);
        question.setSubtopic(subtopic);

        Question updatedQuestion = questionRepository.save(question);
        return mapToQuestionResponse(updatedQuestion);
    }

    @Transactional
    public void deleteQuestion(Integer id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        
        User currentUser = getCurrentUser();
        if (!question.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this question");
        }

        questionRepository.delete(question);
    }

    @Transactional
    public QuestionResponse upvoteQuestion(Integer id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        
        question.setUpvotes(question.getUpvotes() + 1);
        Question updatedQuestion = questionRepository.save(question);
        return mapToQuestionResponse(updatedQuestion);
    }

    @Transactional
    public QuestionResponse downvoteQuestion(Integer id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        
        question.setDownvotes(question.getDownvotes() + 1);
        Question updatedQuestion = questionRepository.save(question);
        return mapToQuestionResponse(updatedQuestion);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String generateSlug(String title) {
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-");
    }

    private QuestionResponse mapToQuestionResponse(Question question) {
        QuestionResponse response = new QuestionResponse();
        response.setId(question.getId());
        response.setTitle(question.getTitle());
        response.setSlug(question.getSlug());
        response.setDescription(question.getDescription());
        response.setContentFingerprint(question.getContentFingerprint());
        response.setDifficulty(question.getDifficulty().name());
        response.setImportanceTag(question.getImportanceTag());
        response.setUpvotes(question.getUpvotes());
        response.setDownvotes(question.getDownvotes());
        response.setCreatedAt(question.getCreatedAt());

        // Map track
        if (question.getTrack() != null) {
            QuestionResponse.TrackDTO trackDTO = new QuestionResponse.TrackDTO();
            trackDTO.setId(question.getTrack().getId());
            trackDTO.setName(question.getTrack().getName());
            response.setTrack(trackDTO);
        }

        // Map subtopic
        if (question.getSubtopic() != null) {
            QuestionResponse.SubtopicDTO subtopicDTO = new QuestionResponse.SubtopicDTO();
            subtopicDTO.setId(question.getSubtopic().getId());
            subtopicDTO.setName(question.getSubtopic().getName());
            
            if (question.getSubtopic().getTopic() != null) {
                QuestionResponse.TopicDTO topicDTO = new QuestionResponse.TopicDTO();
                topicDTO.setId(question.getSubtopic().getTopic().getId());
                topicDTO.setName(question.getSubtopic().getTopic().getName());
                subtopicDTO.setTopic(topicDTO);
            }
            
            response.setSubtopic(subtopicDTO);
        }

        // Map created by user
        if (question.getCreatedBy() != null) {
            QuestionResponse.UserDTO userDTO = new QuestionResponse.UserDTO();
            userDTO.setId(question.getCreatedBy().getId());
            userDTO.setName(question.getCreatedBy().getUsername());
            userDTO.setEmail(question.getCreatedBy().getEmail());
            response.setCreatedBy(userDTO);
        }

        return response;
    }
} 
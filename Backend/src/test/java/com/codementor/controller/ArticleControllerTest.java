package com.codementor.controller;

import com.codementor.dto.article.ArticleResponse;
import com.codementor.dto.article.CreateArticleRequest;
import com.codementor.dto.common.ApiResponse;
import com.codementor.service.ArticleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class ArticleControllerTest {

    @InjectMocks
    private ArticleController articleController;

    @Mock
    private ArticleService articleService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @WithMockUser
    void createArticle_shouldReturnCreatedArticle() {
        CreateArticleRequest request = new CreateArticleRequest();
        ArticleResponse response = new ArticleResponse();
        when(articleService.createArticle(request)).thenReturn(response);

        ResponseEntity<ApiResponse<ArticleResponse>> result = articleController.createArticle(request);

        assertThat(result.getBody().getData()).isEqualTo(response);
        verify(articleService).createArticle(request);
    }

    @Test
    void getArticleById_shouldReturnArticle() {
        int id = 1;
        ArticleResponse response = new ArticleResponse();
        when(articleService.getArticleById(id)).thenReturn(response);

        ResponseEntity<ApiResponse<ArticleResponse>> result = articleController.getArticleById(id);

        assertThat(result.getBody().getData()).isEqualTo(response);
        verify(articleService).getArticleById(id);
    }

    @Test
    void getArticles_shouldReturnPagedArticles() {
        Page<ArticleResponse> page = new PageImpl<>(List.of(new ArticleResponse()));
        when(articleService.getArticlesByFilters(null, null, null, null, Pageable.unpaged())).thenReturn(page);

        ResponseEntity<ApiResponse<Page<ArticleResponse>>> result = articleController.getArticles(null, null, null, null, Pageable.unpaged());

        assertThat(result.getBody().getData()).isEqualTo(page);
        verify(articleService).getArticlesByFilters(null, null, null, null, Pageable.unpaged());
    }

    @Test
    @WithMockUser
    void updateArticle_shouldReturnUpdatedArticle() {
        int id = 1;
        CreateArticleRequest request = new CreateArticleRequest();
        ArticleResponse response = new ArticleResponse();
        when(articleService.updateArticle(id, request)).thenReturn(response);

        ResponseEntity<ApiResponse<ArticleResponse>> result = articleController.updateArticle(id, request);

        assertThat(result.getBody().getData()).isEqualTo(response);
        verify(articleService).updateArticle(id, request);
    }

    @Test
    @WithMockUser
    void deleteArticle_shouldReturnSuccess() {
        int id = 1;

        ResponseEntity<ApiResponse<Void>> result = articleController.deleteArticle(id);

        assertThat(result.getBody().getMessage()).isEqualTo("Article deleted successfully");
        verify(articleService).deleteArticle(id);
    }

    @Test
    void getArticlesBySubtopicId_shouldReturnArticles() {
        int subtopicId = 2;
        List<ArticleResponse> articles = List.of(new ArticleResponse());
        when(articleService.getArticlesBySubtopicId(subtopicId)).thenReturn(articles);

        ResponseEntity<ApiResponse<List<ArticleResponse>>> result = articleController.getArticlesBySubtopicId(subtopicId);

        assertThat(result.getBody().getData()).isEqualTo(articles);
        verify(articleService).getArticlesBySubtopicId(subtopicId);
    }
}
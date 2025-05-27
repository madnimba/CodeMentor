package com.codementor.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class SupabaseService {
    
    private final WebClient supabaseWebClient;

    public SupabaseService(WebClient supabaseWebClient) {
        this.supabaseWebClient = supabaseWebClient;
    }

    // Example method to fetch data from a table
    public Mono<String> fetchData(String tableName) {
        return supabaseWebClient
                .get()
                .uri("/rest/v1/" + tableName)
                .retrieve()
                .bodyToMono(String.class);
    }

    // Example method to insert data into a table
    public Mono<String> insertData(String tableName, Object data) {
        return supabaseWebClient
                .post()
                .uri("/rest/v1/" + tableName)
                .bodyValue(data)
                .retrieve()
                .bodyToMono(String.class);
    }

    // Example method to update data in a table
    public Mono<String> updateData(String tableName, String id, Object data) {
        return supabaseWebClient
                .patch()
                .uri("/rest/v1/" + tableName + "?id=eq." + id)
                .bodyValue(data)
                .retrieve()
                .bodyToMono(String.class);
    }

    // Example method to delete data from a table
    public Mono<String> deleteData(String tableName, String id) {
        return supabaseWebClient
                .delete()
                .uri("/rest/v1/" + tableName + "?id=eq." + id)
                .retrieve()
                .bodyToMono(String.class);
    }
} 
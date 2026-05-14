package com.highdev.breazelife.shared.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(

        @JsonProperty("message")
        String message,

        @JsonProperty("status_code")
        int statusCode,

        @JsonProperty("status")
        String status,

        @JsonProperty("data")
        T data,

        @JsonProperty("pagination")
        PaginationMeta pagination

) {
    public static <T> ApiResponse<T> of(String message, int statusCode, String status, T data) {
        return new ApiResponse<>(message, statusCode, status, data, null);
    }

    public static <T> ApiResponse<T> of(String message, int statusCode, String status, T data, PaginationMeta pagination) {
        return new ApiResponse<>(message, statusCode, status, data, pagination);
    }

    public static <T> ApiResponse<T> of(String message, int statusCode, String status) {
        return new ApiResponse<>(message, statusCode, status, null, null);
    }
}

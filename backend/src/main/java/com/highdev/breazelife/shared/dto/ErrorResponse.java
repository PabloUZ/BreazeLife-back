package com.highdev.breazelife.shared.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(

        @JsonProperty("message")
        String message,

        @JsonProperty("message_code")
        String messageCode,

        @JsonProperty("status_code")
        int statusCode,

        @JsonProperty("status")
        String status,

        @JsonProperty("details")
        Map<String, String> details

) {
    public static ErrorResponse of(String message, String messageCode, int statusCode, String status) {
        return new ErrorResponse(message, messageCode, statusCode, status, null);
    }

    public static ErrorResponse of(String message, String messageCode, int statusCode, String status, Map<String, String> details) {
        return new ErrorResponse(message, messageCode, statusCode, status, details);
    }
}

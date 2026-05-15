package com.highdev.breazelife.shared.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ErrorResponse(

        @JsonProperty("message")
        String message,

        @JsonProperty("message_code")
        String messageCode,

        @JsonProperty("status_code")
        int statusCode,

        @JsonProperty("status")
        String status

) {
    public static ErrorResponse of(String message, String messageCode, int statusCode, String status) {
        return new ErrorResponse(message, messageCode, statusCode, status);
    }
}

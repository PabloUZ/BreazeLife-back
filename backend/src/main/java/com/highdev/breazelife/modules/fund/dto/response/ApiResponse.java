package com.highdev.breazelife.modules.fund.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
    String message,
    String message_code,
    Integer status_code,
    String status,
    T data
) {
    //constructor para respuestas exitosas
    public static <T> ApiResponse<T> success(String message, Integer statusCode, String status, T data) {
        return new ApiResponse<>(message, null, statusCode, status, data);
    }

    //constructor para errores
    public static ApiResponse<Void> error(String message, String messageCode, Integer statusCode, String status) {
        return new ApiResponse<>(message, messageCode, statusCode, status, null);
    }

    //constructor para errores con data (por ejemplo 422 con lista de fondos insuficientes)
    public static <T> ApiResponse<T> errorWithData(String message, String messageCode, Integer statusCode, String status, T data) {
        return new ApiResponse<>(message, messageCode, statusCode, status, data);
    }
}
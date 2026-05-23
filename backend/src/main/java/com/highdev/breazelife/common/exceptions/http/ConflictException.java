package com.highdev.breazelife.common.exceptions.http;

import org.springframework.http.HttpStatus;

public class ConflictException extends HttpException {
    public ConflictException(String code, String message) {
        super(HttpStatus.CONFLICT, code, message);
    }
}

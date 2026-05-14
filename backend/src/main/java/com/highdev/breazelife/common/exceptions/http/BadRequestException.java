package com.highdev.breazelife.common.exceptions.http;

import org.springframework.http.HttpStatus;

public class BadRequestException extends HttpException {
    public BadRequestException(String code, String message) {
        super(HttpStatus.BAD_REQUEST, code, message);
    }
}

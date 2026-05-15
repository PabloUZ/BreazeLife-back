package com.highdev.breazelife.modules.user.exception;

public class EmailAlreadyExistsException extends RuntimeException {
    public EmailAlreadyExistsException() {
        super("Email already in use");
    }
}

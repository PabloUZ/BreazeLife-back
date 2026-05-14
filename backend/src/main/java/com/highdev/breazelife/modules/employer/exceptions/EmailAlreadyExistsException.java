package com.highdev.breazelife.modules.employer.exceptions;

public class EmailAlreadyExistsException extends RuntimeException {
    public EmailAlreadyExistsException(String email) {
        super("An user with email " + email + " already exists");
    }
}
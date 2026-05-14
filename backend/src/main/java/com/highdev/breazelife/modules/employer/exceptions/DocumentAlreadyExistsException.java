package com.highdev.breazelife.modules.employer.exceptions;

public class DocumentAlreadyExistsException extends RuntimeException {
    public DocumentAlreadyExistsException(String document) {
        super("An employee with document " + document + " already exists");
    }
}
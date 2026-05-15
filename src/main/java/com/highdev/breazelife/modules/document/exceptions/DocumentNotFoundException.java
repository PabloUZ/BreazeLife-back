package com.highdev.breazelife.modules.document.exceptions;

public class DocumentNotFoundException extends RuntimeException {
    public DocumentNotFoundException(String message) {
        super(message);
    }
}

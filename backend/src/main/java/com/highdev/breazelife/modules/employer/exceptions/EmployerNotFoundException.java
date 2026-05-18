package com.highdev.breazelife.modules.employer.exceptions;

public class EmployerNotFoundException extends RuntimeException {
    public EmployerNotFoundException(String employerId) {
        super("Employer not found with id: " + employerId);
    }
}
package com.highdev.breazelife.modules.affiliate.exceptions;

public class AffiliateAlreadyExistsException extends RuntimeException {
    public AffiliateAlreadyExistsException(String document) {
        super("Affiliate with document " + document + " is already registered.");
    }
}
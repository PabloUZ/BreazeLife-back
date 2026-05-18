package com.highdev.breazelife.modules.quote.exceptions;

public class QuoteAlreadyProcessedException extends RuntimeException {
    public QuoteAlreadyProcessedException(String quoteId) {
        super("The quote with ID: " + quoteId + " has already been processed and accumulated.");
    }
}
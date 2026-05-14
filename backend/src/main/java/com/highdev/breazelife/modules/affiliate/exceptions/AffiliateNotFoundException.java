package com.highdev.breazelife.modules.affiliate.exceptions;

public class AffiliateNotFoundException extends RuntimeException {
    private final String code;
    public AffiliateNotFoundException(String affiliateId) {
        super("Affiliate with id: " + affiliateId+ " not found");
        this.code = "AFFILIATE_NOT_FOUND";
        
    }

    public String getCode() {
        return this.code;
    }
}


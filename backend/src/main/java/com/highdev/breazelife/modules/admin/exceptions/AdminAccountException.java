package com.highdev.breazelife.modules.admin.exceptions;

public abstract class AdminAccountException extends RuntimeException {
    private final String code;

    protected AdminAccountException(String code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}

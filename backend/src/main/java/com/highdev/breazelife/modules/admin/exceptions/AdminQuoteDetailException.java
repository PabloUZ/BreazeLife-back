package com.highdev.breazelife.modules.admin.exceptions;

public class AdminQuoteDetailException extends AdminQuoteException {

    public AdminQuoteDetailException(Throwable cause) {
        super("ADMIN_QUOTE_DETAIL_ERROR", "Failed to retrieve admin quote detail", cause);
    }
}

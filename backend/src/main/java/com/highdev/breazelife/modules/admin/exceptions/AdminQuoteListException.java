package com.highdev.breazelife.modules.admin.exceptions;

public class AdminQuoteListException extends AdminQuoteException {

    public AdminQuoteListException(Throwable cause) {
        super("ADMIN_QUOTE_LIST_ERROR", "Failed to retrieve admin quotes", cause);
    }
}

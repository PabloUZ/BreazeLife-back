package com.highdev.breazelife.modules.admin.exceptions;

public class AdminAccountDetailException extends AdminAccountException {

    public AdminAccountDetailException(Throwable cause) {
        super("ADMIN_ACCOUNT_DETAIL_ERROR", "Failed to retrieve admin account detail", cause);
    }
}

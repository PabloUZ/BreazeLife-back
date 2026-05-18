package com.highdev.breazelife.modules.admin.exceptions;

public class AdminAccountListException extends AdminAccountException {

    public AdminAccountListException(Throwable cause) {
        super("ADMIN_ACCOUNT_LIST_ERROR", "Failed to retrieve admin accounts", cause);
    }
}

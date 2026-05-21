package com.highdev.breazelife.modules.notification.exceptions;

public class ForbiddenNotificationException extends RuntimeException {
    public ForbiddenNotificationException() {
        super("You do not have permission to access this notification");
    }
}

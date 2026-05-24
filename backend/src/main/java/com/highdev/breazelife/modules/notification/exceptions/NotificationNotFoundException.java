package com.highdev.breazelife.modules.notification.exceptions;

public class NotificationNotFoundException extends RuntimeException {
    public NotificationNotFoundException() {
        super("Notification not found");
    }
}

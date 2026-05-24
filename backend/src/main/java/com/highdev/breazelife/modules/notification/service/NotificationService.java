package com.highdev.breazelife.modules.notification.service;

import com.highdev.breazelife.modules.notification.dto.response.MarkReadResponse;
import com.highdev.breazelife.modules.notification.dto.response.NotificationResponse;
import com.highdev.breazelife.modules.notification.entity.Notification;
import com.highdev.breazelife.modules.notification.exceptions.ForbiddenNotificationException;
import com.highdev.breazelife.modules.notification.exceptions.NotificationNotFoundException;
import com.highdev.breazelife.modules.notification.repository.NotificationRepository;
import com.highdev.breazelife.modules.user.entity.User;
import com.highdev.breazelife.modules.user.repository.UserRepository;
import com.highdev.breazelife.shared.dto.PaginationMeta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public record NotificationsPage(List<NotificationResponse> items, PaginationMeta pagination) {}

    public NotificationsPage getNotifications(String userId, int page, int limit, Boolean read) {
        PageRequest pageable = PageRequest.of(page - 1, limit);
        Page<Notification> result = (read != null)
                ? notificationRepository.findByUserIdAndReadOrderByIdDesc(userId, read, pageable)
                : notificationRepository.findByUserIdOrderByIdDesc(userId, pageable);

        List<NotificationResponse> items = result.getContent().stream()
                .map(NotificationResponse::from)
                .toList();
        PaginationMeta pagination = new PaginationMeta(page, limit, result.getTotalElements());

        return new NotificationsPage(items, pagination);
    }

    public MarkReadResponse markAsRead(String userId, String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(NotificationNotFoundException::new);

        if (!notification.getUser().getId().equals(userId)) {
            throw new ForbiddenNotificationException();
        }

        notification.setRead(true);
        return MarkReadResponse.from(notificationRepository.save(notification));
    }

    public void deleteNotification(String userId, String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(NotificationNotFoundException::new);

        if (!notification.getUser().getId().equals(userId)) {
            throw new ForbiddenNotificationException();
        }

        notificationRepository.delete(notification);
    }

    public void createNotification(String userId, String message) {
        User user = userRepository.getReferenceById(userId);

        long count = notificationRepository.findMaxSequence() + 1;
        String id = String.format("NOT-%06d", count);

        Notification notification = new Notification();
        notification.setId(id);
        notification.setUser(user);
        notification.setMessage(message);

        Notification saved = notificationRepository.save(notification);

        messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/notifications",
                NotificationResponse.from(saved)
        );
    }
}

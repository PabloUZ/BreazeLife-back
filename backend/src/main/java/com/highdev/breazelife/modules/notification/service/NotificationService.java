package com.highdev.breazelife.modules.notification.service;

import com.highdev.breazelife.common.exceptions.http.BadRequestException;
import com.highdev.breazelife.modules.notification.dto.response.AdminNotificationResponseDto;
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

    public record AdminNotificationsPage(List<AdminNotificationResponseDto> items, PaginationMeta pagination) {}

    public NotificationsPage getNotifications(String userId, int page, int limit, Boolean read) {
        validatePagination(page, limit);

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

    public AdminNotificationsPage getAdminNotifications(String userId, int page, int limit, Boolean read) {
        validatePagination(page, limit);

        PageRequest pageable = PageRequest.of(page - 1, limit);
        Page<Notification> result = (read != null)
                ? notificationRepository.findByUserIdAndReadOrderByCreatedAtDescIdDesc(userId, read, pageable)
                : notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(userId, pageable);

        List<AdminNotificationResponseDto> items = result.getContent().stream()
                .map(AdminNotificationResponseDto::from)
                .toList();
        PaginationMeta pagination = new PaginationMeta(page, limit, result.getTotalElements());

        return new AdminNotificationsPage(items, pagination);
    }

    public MarkReadResponse markAsRead(String userId, String notificationId) {
        Notification notification = findOwnedNotification(userId, notificationId);

        if (!Boolean.TRUE.equals(notification.getRead())) {
            notification.setRead(true);
            notification = notificationRepository.save(notification);
        }

        return MarkReadResponse.from(notification);
    }

    public AdminNotificationResponseDto markAdminNotificationAsRead(String userId, String notificationId) {
        Notification notification = findOwnedNotification(userId, notificationId);

        if (!Boolean.TRUE.equals(notification.getRead())) {
            notification.setRead(true);
            notification = notificationRepository.save(notification);
        }

        return AdminNotificationResponseDto.from(notification);
    }

    public void deleteNotification(String userId, String notificationId) {
        Notification notification = findOwnedNotification(userId, notificationId);

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

    public long countUnreadNotifications(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    private Notification findOwnedNotification(String userId, String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(NotificationNotFoundException::new);

        if (!notification.getUser().getId().equals(userId)) {
            throw new ForbiddenNotificationException();
        }

        return notification;
    }

    private void validatePagination(int page, int limit) {
        if (page < 1 || limit < 1) {
            throw new BadRequestException("INVALID_PAGINATION", "Page and limit must be greater than zero");
        }
    }
}

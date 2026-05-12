package com.highdev.breazelife.modules.notification.repository;

import com.highdev.breazelife.modules.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    Page<Notification> findByUserIdOrderByIdDesc(String userId, Pageable pageable);

    Page<Notification> findByUserIdAndReadOrderByIdDesc(String userId, Boolean read, Pageable pageable);

    Optional<Notification> findByIdAndUserId(String id, String userId);
}

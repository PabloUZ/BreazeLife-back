package com.highdev.breazelife.modules.notification.repository;

import com.highdev.breazelife.modules.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    Page<Notification> findByUserIdOrderByIdDesc(String userId, Pageable pageable);

    Page<Notification> findByUserIdAndReadOrderByIdDesc(String userId, Boolean read, Pageable pageable);

    Page<Notification> findByUserIdOrderByCreatedAtDescIdDesc(String userId, Pageable pageable);

    Page<Notification> findByUserIdAndReadOrderByCreatedAtDescIdDesc(String userId, Boolean read, Pageable pageable);

    Optional<Notification> findByIdAndUserId(String id, String userId);

    long countByUserIdAndReadFalse(String userId);

    /** Devuelve el número secuencial más alto usado en los IDs tipo NOT-000042. */
    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(n.id, 5) AS long)), 0) FROM Notification n")
    long findMaxSequence();
}

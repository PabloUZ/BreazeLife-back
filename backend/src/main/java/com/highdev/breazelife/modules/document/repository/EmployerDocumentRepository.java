package com.highdev.breazelife.modules.document.repository;

import com.highdev.breazelife.modules.document.entity.EmployerDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmployerDocumentRepository extends JpaRepository<EmployerDocument, String> {

    Page<EmployerDocument> findByEmployerUserIdOrderByGeneratedAtDesc(String employerUserId, Pageable pageable);

    Page<EmployerDocument> findByEmployerUserIdAndTypeOrderByGeneratedAtDesc(String employerUserId, EmployerDocument.DocumentType type, Pageable pageable);

    Page<EmployerDocument> findByEmployerUserIdAndGeneratedAtBetweenOrderByGeneratedAtDesc(String employerUserId, LocalDateTime from, LocalDateTime to, Pageable pageable);

    Optional<EmployerDocument> findByIdAndEmployerUserId(String id, String employerUserId);
}

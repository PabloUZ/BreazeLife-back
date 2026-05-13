package com.highdev.breazelife.modules.payment.repository;

import com.highdev.breazelife.modules.payment.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {

    Page<Payment> findByContractAffiliateUserIdOrderByDateDesc(String affiliateUserId, Pageable pageable);

    Page<Payment> findByContractAffiliateUserIdAndDateBetweenOrderByDateDesc(String affiliateUserId, LocalDateTime from, LocalDateTime to, Pageable pageable);

    Page<Payment> findByContractEmployerUserIdOrderByDateDesc(String employerUserId, Pageable pageable);

    boolean existsByContractIdAndDateBetween(String contractId, LocalDateTime from, LocalDateTime to);
}

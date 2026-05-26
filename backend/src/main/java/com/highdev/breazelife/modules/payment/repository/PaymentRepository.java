package com.highdev.breazelife.modules.payment.repository;

import com.highdev.breazelife.modules.payment.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {

    Page<Payment> findByContractAffiliateUserIdOrderByDateDesc(String affiliateUserId, Pageable pageable);

    Page<Payment> findByContractAffiliateUserIdAndDateBetweenOrderByDateDesc(String affiliateUserId, LocalDateTime from, LocalDateTime to, Pageable pageable);

    Page<Payment> findByContractEmployerUserIdOrderByDateDesc(String employerUserId, Pageable pageable);

    boolean existsByContractIdAndDateBetween(String contractId, LocalDateTime from, LocalDateTime to);

    boolean existsByContractEmployerUserIdAndDateBetween(String employerUserId, LocalDateTime from, LocalDateTime to);

    // ─── Payroll history ─────────────────────────────────────────────────────

    interface PayrollSummaryProjection {
        String getPeriod();
        Long getTotalEmployees();
        BigDecimal getTotalNetSalary();
        LocalDateTime getExecutedAt();
    }

    @Query(
        value = """
            SELECT DATE_FORMAT(p.date, '%Y-%m') AS period,
                   COUNT(p.id)                  AS totalEmployees,
                   SUM(p.net_salary)             AS totalNetSalary,
                   MIN(p.date)                   AS executedAt
            FROM payments p
            JOIN contracts c ON p.contract_id = c.id
            WHERE c.employer = :employerId
            AND (:period IS NULL OR DATE_FORMAT(p.date, '%Y-%m') = :period)
            GROUP BY DATE_FORMAT(p.date, '%Y-%m')
            ORDER BY MIN(p.date) DESC
            """,
        countQuery = """
            SELECT COUNT(DISTINCT DATE_FORMAT(p.date, '%Y-%m'))
            FROM payments p
            JOIN contracts c ON p.contract_id = c.id
            WHERE c.employer = :employerId
            AND (:period IS NULL OR DATE_FORMAT(p.date, '%Y-%m') = :period)
            """,
        nativeQuery = true
    )
    Page<PayrollSummaryProjection> findPayrollSummaries(
        @Param("employerId") String employerId,
        @Param("period") String period,
        Pageable pageable
    );

    @Query("SELECT p FROM Payment p WHERE p.contract.employer.userId = :employerId " +
           "AND function('date_format', p.date, '%Y-%m') = :period " +
           "ORDER BY p.date ASC")
    List<Payment> findByEmployerAndPeriod(
        @Param("employerId") String employerId,
        @Param("period") String period
    );

}

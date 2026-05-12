package com.highdev.breazelife.modules.profitability.repository;

import com.highdev.breazelife.modules.profitability.entity.ProfitabilityHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface ProfitabilityHistoryRepository extends JpaRepository<ProfitabilityHistory, String> {

    Page<ProfitabilityHistory> findByAccountIdOrderByDateDesc(String accountId, Pageable pageable);

    Optional<ProfitabilityHistory> findTopByAccountIdOrderByDateDesc(String accountId);

    Page<ProfitabilityHistory> findByAccountIdAndDateBetweenOrderByDateDesc(String accountId, LocalDate from, LocalDate to, Pageable pageable);
}

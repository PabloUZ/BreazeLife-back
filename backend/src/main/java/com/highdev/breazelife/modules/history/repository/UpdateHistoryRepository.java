package com.highdev.breazelife.modules.history.repository;

import com.highdev.breazelife.modules.history.entity.UpdateHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UpdateHistoryRepository extends JpaRepository<UpdateHistory, Integer> {

    Page<UpdateHistory> findByContractIdOrderByDateDesc(String contractId, Pageable pageable);
}

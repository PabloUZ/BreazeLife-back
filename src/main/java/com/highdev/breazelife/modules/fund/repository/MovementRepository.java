package com.highdev.breazelife.modules.fund.repository;

import com.highdev.breazelife.modules.fund.entity.Movement;
import com.highdev.breazelife.modules.fund.enums.FundType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface MovementRepository extends JpaRepository<Movement, String> {

    @Query("SELECT m FROM Movement m WHERE m.fund.id.employerId = :employerId " +
           "AND m.fund.id.type = :fundType " +
           "AND (:fromDate IS NULL OR m.date >= :fromDate) " +
           "AND (:toDate IS NULL OR m.date <= :toDate) " +
           "ORDER BY m.date DESC")
    Page<Movement> findMovementsWithFilters(
            @Param("employerId") String employerId,
            @Param("fundType") FundType fundType,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable
    );
}
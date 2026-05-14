package com.highdev.breazelife.modules.movement.repository;

import com.highdev.breazelife.modules.fund.entity.Fund;
import com.highdev.breazelife.modules.movement.entity.Movement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovementRepository extends JpaRepository<Movement, String> {

    Page<Movement> findByFundsIdAndFundTypeOrderByDateDesc(String fundsId, Fund.FundType fundType, Pageable pageable);
}

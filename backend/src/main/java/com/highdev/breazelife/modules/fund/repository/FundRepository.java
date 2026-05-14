package com.highdev.breazelife.modules.fund.repository;

import com.highdev.breazelife.modules.fund.entity.Fund;
import com.highdev.breazelife.modules.fund.entity.FundId;
import com.highdev.breazelife.modules.fund.enums.FundType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FundRepository extends JpaRepository<Fund, FundId> {

    List<Fund> findByEmployerId(String employerId);

    Optional<Fund> findByEmployerIdAndType(String employerId, FundType type);
}
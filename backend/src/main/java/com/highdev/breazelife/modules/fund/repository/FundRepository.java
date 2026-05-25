package com.highdev.breazelife.modules.fund.repository;

import com.highdev.breazelife.modules.fund.entity.Fund;
import com.highdev.breazelife.modules.fund.entity.FundId;
import com.highdev.breazelife.modules.fund.enums.FundType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface FundRepository extends JpaRepository<Fund, FundId> {

    interface FundTypeBalanceProjection {
        FundType getFundType();
        BigDecimal getTotalBalance();
    }

    List<Fund> findByEmployerId(String employerId);

    Optional<Fund> findByEmployerIdAndType(String employerId, FundType type);

    @Query("""
            select f.type as fundType, coalesce(sum(f.balance), 0) as totalBalance
            from Fund f
            group by f.type
            """)
    List<FundTypeBalanceProjection> sumBalancesGroupedByType();
}

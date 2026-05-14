package com.highdev.breazelife.modules.fund.service.impl;

import com.highdev.breazelife.modules.fund.dto.request.RechargeFundRequest;
import com.highdev.breazelife.modules.fund.dto.response.FundResponse;
import com.highdev.breazelife.modules.fund.entity.Fund;
import com.highdev.breazelife.modules.fund.entity.FundId;
import com.highdev.breazelife.modules.fund.entity.Movement;
import com.highdev.breazelife.modules.fund.enums.FundType;
import com.highdev.breazelife.modules.fund.enums.MovementType;
import com.highdev.breazelife.modules.fund.exceptions.FundNotFoundException;
import com.highdev.breazelife.modules.fund.repository.FundRepository;
import com.highdev.breazelife.modules.fund.repository.MovementRepository;
import com.highdev.breazelife.modules.fund.service.FundsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FundsServiceImpl implements FundsService {

    private final FundRepository fundRepository;
    private final MovementRepository movementRepository;

    @Override
    @Transactional
    public void initializeFunds(String employerId) {
        //solo los crea si no existen previamente
        if (fundRepository.findByIdEmployerId(employerId).isEmpty()) {
            Fund payroll = Fund.builder()
                    .employerId(employerId)
                    .type(FundType.PAYROLL)
                    .build();
            Fund pension = Fund.builder()
                    .employerId(employerId)
                    .type(FundType.PENSION)
                    .build();
            fundRepository.saveAll(List.of(payroll, pension));
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<FundResponse> getFunds(String employerId) {
        List<Fund> funds = fundRepository.findByIdEmployerId(employerId);
        if (funds.isEmpty()) {
            throw new FundNotFoundException(employerId);
        }
        return funds.stream().map(FundResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FundResponse getFundByType(String employerId, FundType fundType) {
        return FundResponse.from(getFundEntity(employerId, fundType));
    }

    @Override
    @Transactional
    public FundResponse rechargeFund(String employerId, FundType fundType, RechargeFundRequest request) {
        Fund fund = getFundEntity(employerId, fundType);
        
        //actualizar el saldo
        fund.addFunds(request.amount());
        fundRepository.save(fund);

        //registrar el ingreso
        Movement movement = Movement.builder()
                .fund(fund)
                .type(MovementType.INCOME)
                .amount(request.amount())
                .build();
        movementRepository.save(movement);

        return FundResponse.from(fund);
    }

    //metodo para obtener el fondo por id y tipo de fondo
    private Fund getFundEntity(String employerId, FundType type) {
        return fundRepository.findById(new FundId(employerId, type))
                .orElseThrow(() -> new FundNotFoundException(employerId, type));
    }
}
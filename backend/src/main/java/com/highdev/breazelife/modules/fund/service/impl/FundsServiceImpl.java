package com.highdev.breazelife.modules.fund.service.impl;

import com.highdev.breazelife.modules.fund.dto.request.DeductFundsRequest;
import com.highdev.breazelife.modules.fund.dto.request.RechargeFundRequest;
import com.highdev.breazelife.modules.fund.dto.request.ValidateFundsRequest;
import com.highdev.breazelife.modules.fund.dto.response.FundResponse;
import com.highdev.breazelife.modules.fund.dto.response.FundValidationResponse;
import com.highdev.breazelife.modules.fund.dto.response.MovementPageResponse;
import com.highdev.breazelife.modules.fund.dto.response.MovementResponse;
import com.highdev.breazelife.modules.fund.entity.Fund;
import com.highdev.breazelife.modules.fund.entity.FundId;
import com.highdev.breazelife.modules.fund.entity.Movement;
import com.highdev.breazelife.modules.fund.enums.FundType;
import com.highdev.breazelife.modules.fund.enums.MovementType;
import com.highdev.breazelife.modules.fund.exceptions.FundNotFoundException;
import com.highdev.breazelife.modules.fund.exceptions.InsufficientFundsException;
import com.highdev.breazelife.modules.fund.repository.FundRepository;
import com.highdev.breazelife.modules.fund.repository.MovementRepository;
import com.highdev.breazelife.modules.fund.service.FundsService;
import com.highdev.breazelife.modules.notification.events.InsufficientFundsEvent;

import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.context.ApplicationEventPublisher;


import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service

public class FundsServiceImpl implements FundsService {

    private final FundRepository fundRepository;
    private final MovementRepository movementRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ApplicationEventPublisher eventPublisher;

    public FundsServiceImpl(
            FundRepository fundRepository,
            MovementRepository movementRepository,
            @Autowired(required = false) SimpMessagingTemplate messagingTemplate,
            ApplicationEventPublisher eventPublisher) {
        this.fundRepository = fundRepository;
        this.movementRepository = movementRepository;
        this.messagingTemplate = messagingTemplate;
        this.eventPublisher = eventPublisher;
    }

    //nos ayudará a emitir eventos en tiempo real cuando hayan cambios en los fondos
    private void emitWebSocketEvent(String employerId, String eventName, Map<String, Object> eventData) {
        if (messagingTemplate != null) {
            String channel = "/topic/employers/" + employerId + "/funds";
            Map<String, Object> payload = Map.of(
                "event", eventName,
                "employer_id", employerId,
                "data", eventData
            );
            messagingTemplate.convertAndSend(channel, (Object) payload);
        }
    }


    @Override
    @Transactional
    public void initializeFunds(String employerId) {
        //solo los crea si no existen previamente
        if (fundRepository.findByEmployerId(employerId).isEmpty()) {
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
        List<Fund> funds = fundRepository.findByEmployerId(employerId);
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
        fund = fundRepository.saveAndFlush(fund);

        //registrar el ingreso
        Movement movement = Movement.builder()
                .fund(fund)
                .type(MovementType.INCOME)
                .amount(request.amount())
                .build();
        movementRepository.save(movement);

        return FundResponse.from(fund);
    }


    @Override
    @Transactional(readOnly = true)
    public MovementPageResponse getFundMovements(String employerId, FundType fundType, LocalDate from, LocalDate to, int page, int limit) {
        getFundEntity(employerId, fundType);

        LocalDateTime fromDate = (from != null) ? from.atStartOfDay() : null;
        LocalDateTime toDate = (to != null) ? to.atTime(LocalTime.MAX) : null;
        
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Movement> movementPage = movementRepository.findMovementsWithFilters(employerId, fundType, fromDate, toDate, pageable);

        List<MovementResponse> movementResponses = movementPage.getContent().stream().map(MovementResponse::from).toList();

        return new MovementPageResponse(employerId, fundType, movementPage.getTotalElements(), page, limit, movementResponses);
    }



    @Override
    @Transactional
    public FundValidationResponse validateFunds(String employerId, ValidateFundsRequest request) {
        Fund payrollFund = getFundEntity(employerId, FundType.PAYROLL);
        Fund pensionFund = getFundEntity(employerId, FundType.PENSION);

        List<FundValidationResponse.InsufficientFundDetail> shortages = new ArrayList<>();

        if (payrollFund.getBalance().compareTo(request.requiredPayroll()) < 0) {
            shortages.add(new FundValidationResponse.InsufficientFundDetail(
                    FundType.PAYROLL.name(),
                    payrollFund.getBalance(),
                    request.requiredPayroll(),
                    request.requiredPayroll().subtract(payrollFund.getBalance())
            ));
        }

        if (pensionFund.getBalance().compareTo(request.requiredPension()) < 0) {
            shortages.add(new FundValidationResponse.InsufficientFundDetail(
                    FundType.PENSION.name(),
                    pensionFund.getBalance(),
                    request.requiredPension(),
                    request.requiredPension().subtract(pensionFund.getBalance())
            ));
        }

        if (!shortages.isEmpty()) {
            // Publicar un evento por cada fondo insuficiente
            for (FundValidationResponse.InsufficientFundDetail shortage : shortages) {
                InsufficientFundsEvent.FundType eventFundType = switch (shortage.fundType()) {
                    case "PAYROLL" -> InsufficientFundsEvent.FundType.PAYROLL;
                    case "PENSION" -> InsufficientFundsEvent.FundType.EMPLOYER_CONTRIBUTIONS;
                    default -> throw new IllegalArgumentException("Unknown fund type: " + shortage.fundType());
                };

                eventPublisher.publishEvent(new InsufficientFundsEvent(
                    employerId,
                    eventFundType
                ));
            }

            List<InsufficientFundsException.FundShortage> excShortages = shortages.stream()
                .map(s -> new InsufficientFundsException.FundShortage(
                    FundType.valueOf(s.fundType()), s.currentBalance(),
                    s.required(), s.shortage()))
                .toList();
            throw new InsufficientFundsException(excShortages); 
            }

        return new FundValidationResponse(
                true,
                new FundValidationResponse.FundDetail(employerId, FundType.PAYROLL.name(),
                        payrollFund.getBalance(), request.requiredPayroll()),
                new FundValidationResponse.FundDetail(employerId, FundType.PENSION.name(),
                        pensionFund.getBalance(), request.requiredPension()),
                shortages
        );
    }

    @Override
    @Transactional
    public void deductFunds(String employerId, DeductFundsRequest request) {
        Fund payrollFund = getFundEntity(employerId, FundType.PAYROLL);
        Fund pensionFund = getFundEntity(employerId, FundType.PENSION);


        //validamos si hay fondos insuficientes silenciosamente
        List<FundValidationResponse.InsufficientFundDetail> shortages = new ArrayList<>();

        if (payrollFund.getBalance().compareTo(request.payrollAmount()) < 0) {
            shortages.add(new FundValidationResponse.InsufficientFundDetail(
                FundType.PAYROLL.name(), payrollFund.getBalance(),
                request.payrollAmount(),
                request.payrollAmount().subtract(payrollFund.getBalance())));
        }

        if (pensionFund.getBalance().compareTo(request.pensionAmount()) < 0) {
            shortages.add(new FundValidationResponse.InsufficientFundDetail(
                FundType.PENSION.name(), pensionFund.getBalance(),
                request.pensionAmount(),
                request.pensionAmount().subtract(pensionFund.getBalance())));
        }

        if (!shortages.isEmpty()) {
            List<InsufficientFundsException.FundShortage> excShortages = shortages.stream()
                .map(s -> new InsufficientFundsException.FundShortage(
                    FundType.valueOf(s.fundType()), s.currentBalance(),
                    s.required(), s.shortage()))
                .toList();
            throw new InsufficientFundsException(excShortages);
        }

        payrollFund.deductFunds(request.payrollAmount());
        pensionFund.deductFunds(request.pensionAmount());
        fundRepository.saveAll(List.of(payrollFund, pensionFund));

        movementRepository.saveAll(List.of(
            Movement.builder().fund(payrollFund)
                .type(MovementType.OUTCOME).amount(request.payrollAmount()).build(),
            Movement.builder().fund(pensionFund)
                .type(MovementType.OUTCOME).amount(request.pensionAmount()).build()
        ));
    }

    private Fund getFundEntity(String employerId, FundType type) {
        return fundRepository.findById(new FundId(employerId, type))
                .orElseThrow(() -> new FundNotFoundException(employerId, type));
    }


}
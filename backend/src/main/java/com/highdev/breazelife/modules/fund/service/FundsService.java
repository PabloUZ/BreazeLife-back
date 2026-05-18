package com.highdev.breazelife.modules.fund.service;

import com.highdev.breazelife.modules.fund.dto.request.DeductFundsRequest;
import com.highdev.breazelife.modules.fund.dto.request.RechargeFundRequest;
import com.highdev.breazelife.modules.fund.dto.request.ValidateFundsRequest;
import com.highdev.breazelife.modules.fund.dto.response.FundResponse;
import com.highdev.breazelife.modules.fund.dto.response.FundValidationResponse;
import com.highdev.breazelife.modules.fund.dto.response.MovementPageResponse;
import com.highdev.breazelife.modules.fund.enums.FundType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface FundsService {

    //metodo para crear los fondos en 0.00 cuando se registra un empleador
    void initializeFunds(String employerId);

    //corresponde al spring 1
    List<FundResponse> getFunds(String employerId);

    //spring 1
    FundResponse getFundByType(String employerId, FundType fundType);

    //corresponde al 2
    FundResponse rechargeFund(String employerId, FundType fundType, RechargeFundRequest request);

    MovementPageResponse getFundMovements(
            String employerId, 
            FundType fundType, 
            LocalDate from, 
            LocalDate to, 
            int page, 
            int limit
    );

    FundValidationResponse validateFunds(String employerId, ValidateFundsRequest request);

    //Realiza descuento desaldos en ambos fondos luego de la ejecución de la nomina
    //registra los movimientos de salida correspondientes
    void deductFunds(String employerId, DeductFundsRequest request);
}
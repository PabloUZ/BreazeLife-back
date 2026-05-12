package com.highdev.breazelife.modules.payment.service;

import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import com.highdev.breazelife.modules.contract.entity.Contract;
import com.highdev.breazelife.modules.contract.repository.ContractRepository;
import com.highdev.breazelife.modules.employer.entity.Employer;
import com.highdev.breazelife.modules.employer.repository.EmployerRepository;
import com.highdev.breazelife.modules.fund.entity.Fund;
import com.highdev.breazelife.modules.fund.repository.FundRepository;
import com.highdev.breazelife.modules.payment.dto.request.PayrollPreviewRequest;
import com.highdev.breazelife.modules.payment.dto.response.EmployeePayrollPreviewResponse;
import com.highdev.breazelife.modules.payment.dto.response.PayrollPreviewResponse;
import com.highdev.breazelife.modules.payment.repository.PaymentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class PayrollService {

    private static final BigDecimal EMPLOYEE_DEDUCTION_RATE    = new BigDecimal("0.04");
    private static final BigDecimal EMPLOYER_CONTRIBUTION_RATE = new BigDecimal("0.12");
    private static final BigDecimal TOTAL_CONTRIBUTION_RATE    = new BigDecimal("0.16");
    private static final BigDecimal NET_SALARY_RATE            = new BigDecimal("0.96");

    private final ContractRepository contractRepository;
    private final FundRepository fundRepository;
    private final EmployerRepository employerRepository;
    private final PaymentRepository paymentRepository;

    public PayrollService(ContractRepository contractRepository,
                          FundRepository fundRepository,
                          EmployerRepository employerRepository,
                          PaymentRepository paymentRepository) {
        this.contractRepository = contractRepository;
        this.fundRepository = fundRepository;
        this.employerRepository = employerRepository;
        this.paymentRepository = paymentRepository;
    }

    // ─── Preview ─────────────────────────────────────────────────────────────

    public PayrollPreviewResponse preview(String employerUserId, PayrollPreviewRequest request) {
        Employer employer = findEmployer(employerUserId);

        // Validar que el periodo no haya sido procesado ya
        validatePeriodNotProcessed(employerUserId, request.getPeriod());

        List<Contract> contracts = getActiveContracts(employerUserId);
        if (contracts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No active employees found");
        }

        BigDecimal payrollFundBalance = getFundBalance(employerUserId, Fund.FundType.PAYROLL);
        BigDecimal pensionFundBalance = getFundBalance(employerUserId, Fund.FundType.PENSION);

        // Calcular detalle por empleado
        List<EmployeePayrollPreviewResponse> employees = new ArrayList<>();
        BigDecimal totalGross                    = BigDecimal.ZERO;
        BigDecimal totalNetSalary                = BigDecimal.ZERO;
        BigDecimal totalEmployerPensionContrib   = BigDecimal.ZERO;
        BigDecimal totalEmployeePensionDeduction = BigDecimal.ZERO;
        BigDecimal totalPensionContrib           = BigDecimal.ZERO;
        BigDecimal totalPayrollFundDebit         = BigDecimal.ZERO;
        BigDecimal totalPensionFundDebit         = BigDecimal.ZERO;

        for (Contract contract : contracts) {
            EmployeePayrollPreviewResponse detail = buildEmployeeDetail(contract);
            employees.add(detail);
            totalGross                    = totalGross.add(detail.getBaseSalary());
            totalNetSalary                = totalNetSalary.add(detail.getNetSalary());
            totalEmployerPensionContrib   = totalEmployerPensionContrib.add(detail.getEmployerPensionContrib());
            totalEmployeePensionDeduction = totalEmployeePensionDeduction.add(detail.getEmployeePensionDeduction());
            totalPensionContrib           = totalPensionContrib.add(detail.getTotalPensionContrib());
            totalPayrollFundDebit         = totalPayrollFundDebit.add(detail.getPayrollFundDebit());
            totalPensionFundDebit         = totalPensionFundDebit.add(detail.getPensionFundDebit());
        }

        BigDecimal totalDebit = totalPayrollFundDebit.add(totalPensionFundDebit);

        // Totals
        PayrollPreviewResponse.Totals totals = new PayrollPreviewResponse.Totals();
        totals.setTotalEmployees(contracts.size());
        totals.setTotalGrossSalary(totalGross);
        totals.setTotalNetSalary(totalNetSalary);
        totals.setTotalEmployerPensionContrib(totalEmployerPensionContrib);
        totals.setTotalEmployeePensionDeduction(totalEmployeePensionDeduction);
        totals.setTotalPensionContrib(totalPensionContrib);
        totals.setTotalPayrollFundDebit(totalPayrollFundDebit);
        totals.setTotalPensionFundDebit(totalPensionFundDebit);
        totals.setTotalDebit(totalDebit);

        // Fund status
        boolean payrollOk = payrollFundBalance.compareTo(totalPayrollFundDebit) >= 0;
        boolean pensionOk = pensionFundBalance.compareTo(totalPensionFundDebit) >= 0;

        PayrollPreviewResponse.FundStatus fundStatus = new PayrollPreviewResponse.FundStatus();
        fundStatus.setPayrollFundSufficient(payrollOk);
        fundStatus.setPensionFundSufficient(pensionOk);
        fundStatus.setCanExecute(payrollOk && pensionOk);

        // Armar response
        PayrollPreviewResponse response = new PayrollPreviewResponse();
        response.setPeriod(request.getPeriod());
        response.setEmployerId(employerUserId);
        response.setCompanyName(employer.getCompanyName());
        response.setPayrollFundBalance(payrollFundBalance);
        response.setPensionFundBalance(pensionFundBalance);
        response.setEmployees(employees);
        response.setTotals(totals);
        response.setFundStatus(fundStatus);

        return response;
    }

    // ─── Execute (sprint 2) ──────────────────────────────────────────────────
    // TODO: descontar fondos, persistir Payment + Quote por contrato,
    //       disparar notificaciones WebSocket

    // ─── Helpers privados ────────────────────────────────────────────────────

    private Employer findEmployer(String employerUserId) {
        return employerRepository.findById(employerUserId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Employer not found"));
    }

    private List<Contract> getActiveContracts(String employerUserId) {
        return contractRepository.findByEmployerUserIdAndAffiliateStatus(
            employerUserId, Affiliate.Status.ACTIVE);
    }

    /**
     * Verifica que el periodo "YYYY-MM" no haya sido procesado ya.
     * Traduce el string a un rango de fechas y consulta si existe algún pago
     * en ese rango para este empleador.
     */
    private void validatePeriodNotProcessed(String employerUserId, String period) {
        YearMonth ym = YearMonth.parse(period, DateTimeFormatter.ofPattern("yyyy-MM"));
        LocalDateTime from = ym.atDay(1).atStartOfDay();
        LocalDateTime to   = ym.atEndOfMonth().atTime(23, 59, 59);

        boolean alreadyProcessed = paymentRepository
            .findByContractEmployerUserIdOrderByDateDesc(employerUserId,
                org.springframework.data.domain.Pageable.unpaged())
            .getContent()
            .stream()
            .anyMatch(p -> !p.getDate().isBefore(from) && !p.getDate().isAfter(to));

        if (alreadyProcessed) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Payroll for period " + period + " has already been processed");
        }
    }

    private EmployeePayrollPreviewResponse buildEmployeeDetail(Contract contract) {
        BigDecimal ibc = contract.getBaseSalary();
        String fullName = contract.getAffiliate().getUser().getFirstName()
            + " " + contract.getAffiliate().getUser().getLastName();

        BigDecimal employeeDeduction    = ibc.multiply(EMPLOYEE_DEDUCTION_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal netSalary            = ibc.multiply(NET_SALARY_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal employerContrib      = ibc.multiply(EMPLOYER_CONTRIBUTION_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalContrib         = ibc.multiply(TOTAL_CONTRIBUTION_RATE).setScale(2, RoundingMode.HALF_UP);

        EmployeePayrollPreviewResponse detail = new EmployeePayrollPreviewResponse();
        detail.setContractId(contract.getId());
        detail.setAffiliateName(fullName);
        detail.setDocument(contract.getAffiliate().getDocument());
        detail.setPosition(contract.getPosition());
        detail.setBaseSalary(ibc.setScale(2, RoundingMode.HALF_UP));
        detail.setEmployeePensionDeduction(employeeDeduction);
        detail.setNetSalary(netSalary);
        detail.setEmployerPensionContrib(employerContrib);
        detail.setTotalPensionContrib(totalContrib);
        detail.setPayrollFundDebit(netSalary);       // del fondo nómina sale el neto
        detail.setPensionFundDebit(employerContrib); // del fondo aportes sale el 12%

        return detail;
    }

    private BigDecimal getFundBalance(String employerUserId, Fund.FundType type) {
        return fundRepository.findByEmployerIdAndType(employerUserId, type)
            .map(Fund::getBalance)
            .orElse(BigDecimal.ZERO);
    }
}
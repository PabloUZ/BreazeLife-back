package com.highdev.breazelife.modules.payment.service;

import com.highdev.breazelife.modules.account.entity.Account;
import com.highdev.breazelife.modules.account.repository.AccountRepository;
import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import com.highdev.breazelife.modules.contract.entity.Contract;
import com.highdev.breazelife.modules.contract.repository.ContractRepository;
import com.highdev.breazelife.modules.employer.entity.Employer;
import com.highdev.breazelife.modules.employer.repository.EmployerRepository;
import com.highdev.breazelife.modules.fund.entity.Fund;
import com.highdev.breazelife.modules.fund.enums.FundType;
import com.highdev.breazelife.modules.fund.repository.FundRepository;
import com.highdev.breazelife.modules.payment.dto.request.ExecutePayrollRequest;
import com.highdev.breazelife.modules.payment.dto.request.PayrollPreviewRequest;
import com.highdev.breazelife.modules.payment.dto.response.EmployeePayrollPreviewResponse;
import com.highdev.breazelife.modules.payment.dto.response.ExecutePayrollResponse;
import com.highdev.breazelife.modules.payment.dto.response.PaymentResultDTO;
import com.highdev.breazelife.modules.payment.dto.response.PayrollPreviewResponse;
import com.highdev.breazelife.modules.payment.entity.Payment;
import com.highdev.breazelife.modules.payment.exceptions.NoActiveEmployeesException;
import com.highdev.breazelife.modules.payment.exceptions.PayrollAlreadyProcessedException;
import com.highdev.breazelife.modules.payment.exceptions.PayrollInsufficientFundsException;
import com.highdev.breazelife.modules.payment.repository.PaymentRepository;
import com.highdev.breazelife.modules.quote.entity.Quote;
import com.highdev.breazelife.modules.quote.repository.QuoteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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
    private final QuoteRepository quoteRepository;
    private final AccountRepository accountRepository;

    public PayrollService(ContractRepository contractRepository,
                          FundRepository fundRepository,
                          EmployerRepository employerRepository,
                          PaymentRepository paymentRepository,
                          QuoteRepository quoteRepository,
                          AccountRepository accountRepository) {
        this.contractRepository = contractRepository;
        this.fundRepository = fundRepository;
        this.employerRepository = employerRepository;
        this.paymentRepository = paymentRepository;
        this.quoteRepository = quoteRepository;
        this.accountRepository = accountRepository;
    }

    // ─── Preview ─────────────────────────────────────────────────────────────

    public PayrollPreviewResponse preview(String employerUserId, PayrollPreviewRequest request) {
        Employer employer = findEmployer(employerUserId);

        validatePeriodNotProcessed(employerUserId, request.getPeriod());

        List<Contract> contracts = getActiveContracts(employerUserId);
        if (contracts.isEmpty()) {
            throw new NoActiveEmployeesException();
        }

        BigDecimal payrollFundBalance = getFundBalance(employerUserId, FundType.PAYROLL);
        BigDecimal pensionFundBalance = getFundBalance(employerUserId, FundType.PENSION);

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

        boolean payrollOk = payrollFundBalance.compareTo(totalPayrollFundDebit) >= 0;
        boolean pensionOk = pensionFundBalance.compareTo(totalPensionFundDebit) >= 0;

        PayrollPreviewResponse.FundStatus fundStatus = new PayrollPreviewResponse.FundStatus();
        fundStatus.setPayrollFundSufficient(payrollOk);
        fundStatus.setPensionFundSufficient(pensionOk);
        fundStatus.setCanExecute(payrollOk && pensionOk);

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

    // ─── Execute ─────────────────────────────────────────────────────────────

    @Transactional
    public ExecutePayrollResponse execute(String employerUserId, ExecutePayrollRequest request) {
        Employer employer = findEmployer(employerUserId);

        validatePeriodNotProcessed(employerUserId, request.getPeriod());

        List<Contract> contracts = getActiveContracts(employerUserId);
        if (contracts.isEmpty()) {
            throw new NoActiveEmployeesException();
        }

        // Calcular totales antes de tocar fondos
        List<EmployeePayrollPreviewResponse> details = new ArrayList<>();
        BigDecimal totalNetSalary      = BigDecimal.ZERO;
        BigDecimal totalEmployerContrib = BigDecimal.ZERO;

        for (Contract contract : contracts) {
            EmployeePayrollPreviewResponse detail = buildEmployeeDetail(contract);
            details.add(detail);
            totalNetSalary       = totalNetSalary.add(detail.getNetSalary());
            totalEmployerContrib = totalEmployerContrib.add(detail.getEmployerPensionContrib());
        }

        // Verificar saldos — si alguno es insuficiente, no persistir nada
        BigDecimal payrollBalance = getFundBalance(employerUserId, FundType.PAYROLL);
        BigDecimal pensionBalance = getFundBalance(employerUserId, FundType.PENSION);

        if (payrollBalance.compareTo(totalNetSalary) < 0 || pensionBalance.compareTo(totalEmployerContrib) < 0) {
            throw new PayrollInsufficientFundsException(
                payrollBalance, totalNetSalary,
                pensionBalance, totalEmployerContrib
            );
        }

        // Cargar entidades Fund para debitar
        Fund payrollFund = fundRepository.findByEmployerIdAndType(employerUserId, FundType.PAYROLL)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Payroll fund not found"));
        Fund pensionFund = fundRepository.findByEmployerIdAndType(employerUserId, FundType.PENSION)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Pension fund not found"));

        LocalDateTime now = LocalDateTime.now();
        // Calcular base de IDs para quotes una sola vez antes del loop
        long quoteBaseCount = quoteRepository.count();

        List<PaymentResultDTO> paymentResults = new ArrayList<>();

        for (int i = 0; i < contracts.size(); i++) {
            Contract contract = contracts.get(i);
            EmployeePayrollPreviewResponse detail = details.get(i);

            // a. Debitar fondo PAYROLL (salario neto)
            payrollFund.deductFunds(detail.getNetSalary());

            // b. Debitar fondo PENSION (aporte patronal 12%)
            pensionFund.deductFunds(detail.getEmployerPensionContrib());

            // c. Persistir Payment
            Payment payment = new Payment();
            payment.setId(UUID.randomUUID().toString());
            payment.setContract(contract);
            payment.setNetSalary(detail.getNetSalary());
            payment.setDate(now);
            paymentRepository.save(payment);

            // d. Crear Quote vinculada al Payment y a la Account del afiliado
            Account account = accountRepository
                .findByAffiliateUserId(contract.getAffiliate().getUserId())
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Account not found for affiliate"));

            Quote quote = new Quote();
            quote.setId(String.format("QTE-%06d", quoteBaseCount + i + 1));
            quote.setAccount(account);
            quote.setPayment(payment);
            quote.setEmployerContrib(detail.getEmployerPensionContrib());
            quote.setAffiliateContrib(detail.getEmployeePensionDeduction());
            quote.setDaysContributed(30);
            quote.setContribDate(now);
            quote.setStatus(Quote.QuoteStatus.PENDING);
            quoteRepository.save(quote);

            PaymentResultDTO result = new PaymentResultDTO();
            result.setPaymentId(payment.getId());
            result.setContractId(contract.getId());
            result.setAffiliateName(detail.getAffiliateName());
            result.setDocument(detail.getDocument());
            result.setNetSalary(detail.getNetSalary());
            result.setQuoteId(quote.getId());
            result.setStatus("PROCESSED");
            paymentResults.add(result);
        }

        // Persistir fondos con los saldos ya debitados
        fundRepository.saveAll(List.of(payrollFund, pensionFund));

        ExecutePayrollResponse.Totals totals = new ExecutePayrollResponse.Totals();
        totals.setTotalEmployees(contracts.size());
        totals.setTotalNetSalaryPaid(totalNetSalary);
        totals.setTotalPensionContrib(totalEmployerContrib);
        totals.setTotalDebit(totalNetSalary.add(totalEmployerContrib));

        ExecutePayrollResponse response = new ExecutePayrollResponse();
        response.setPeriod(request.getPeriod());
        response.setEmployerId(employerUserId);
        response.setCompanyName(employer.getCompanyName());
        response.setStatus("PROCESSED");
        response.setPayments(paymentResults);
        response.setTotals(totals);
        response.setPayrollFundRemaining(payrollFund.getBalance());
        response.setPensionFundRemaining(pensionFund.getBalance());

        return response;
    }

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

    private void validatePeriodNotProcessed(String employerUserId, String period) {
        YearMonth ym = YearMonth.parse(period, DateTimeFormatter.ofPattern("yyyy-MM"));
        LocalDateTime from = ym.atDay(1).atStartOfDay();
        LocalDateTime to   = ym.atEndOfMonth().atTime(23, 59, 59);

        if (paymentRepository.existsByContractEmployerUserIdAndDateBetween(employerUserId, from, to)) {
            throw new PayrollAlreadyProcessedException();
        }
    }

    private EmployeePayrollPreviewResponse buildEmployeeDetail(Contract contract) {
        BigDecimal ibc = contract.getBaseSalary();
        String fullName = contract.getAffiliate().getUser().getFirstName()
            + " " + contract.getAffiliate().getUser().getLastName();

        BigDecimal employeeDeduction = ibc.multiply(EMPLOYEE_DEDUCTION_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal netSalary         = ibc.multiply(NET_SALARY_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal employerContrib   = ibc.multiply(EMPLOYER_CONTRIBUTION_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalContrib      = ibc.multiply(TOTAL_CONTRIBUTION_RATE).setScale(2, RoundingMode.HALF_UP);

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
        detail.setPayrollFundDebit(netSalary);
        detail.setPensionFundDebit(employerContrib);

        return detail;
    }

    private BigDecimal getFundBalance(String employerUserId, FundType type) {
        return fundRepository.findByEmployerIdAndType(employerUserId, type)
            .map(Fund::getBalance)
            .orElse(BigDecimal.ZERO);
    }
}

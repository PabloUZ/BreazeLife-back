package com.highdev.breazelife.modules.payment.service;

import com.highdev.breazelife.modules.account.entity.Account;
import com.highdev.breazelife.modules.account.repository.AccountRepository;
import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import com.highdev.breazelife.modules.contract.entity.Contract;
import com.highdev.breazelife.modules.contract.repository.ContractRepository;
import com.highdev.breazelife.modules.employer.entity.Employer;
import com.highdev.breazelife.modules.employer.repository.EmployerRepository;
import com.highdev.breazelife.modules.fund.dto.request.DeductFundsRequest;
import com.highdev.breazelife.modules.fund.dto.request.ValidateFundsRequest;
import com.highdev.breazelife.modules.fund.dto.response.FundResponse;
import com.highdev.breazelife.modules.fund.enums.FundType;
import com.highdev.breazelife.modules.fund.exceptions.InsufficientFundsException;
import com.highdev.breazelife.modules.fund.service.FundsService;
import com.highdev.breazelife.modules.payment.dto.request.ExecutePayrollRequest;
import com.highdev.breazelife.modules.payment.dto.request.PayrollPreviewRequest;
import com.highdev.breazelife.modules.payment.dto.response.EmployeePayrollPreviewResponse;
import com.highdev.breazelife.modules.payment.dto.response.ExecutePayrollResponse;
import com.highdev.breazelife.modules.payment.dto.response.PaymentResultDTO;
import com.highdev.breazelife.modules.payment.dto.response.PayrollDetailPaymentDTO;
import com.highdev.breazelife.modules.payment.dto.response.PayrollDetailResponse;
import com.highdev.breazelife.modules.payment.dto.response.PayrollHistoryItemDTO;
import com.highdev.breazelife.modules.payment.dto.response.PayrollHistoryResponse;
import com.highdev.breazelife.modules.payment.dto.response.PayrollPreviewResponse;
import com.highdev.breazelife.modules.payment.entity.Payment;
import com.highdev.breazelife.modules.payment.exceptions.NoActiveEmployeesException;
import com.highdev.breazelife.modules.payment.exceptions.PayrollAlreadyProcessedException;
import com.highdev.breazelife.modules.payment.exceptions.PayrollInsufficientFundsException;
import com.highdev.breazelife.modules.payment.dto.response.AffiliatePaymentHistoryResponse;
import com.highdev.breazelife.modules.payment.dto.response.AffiliatePaymentItemDTO;
import com.highdev.breazelife.modules.payment.dto.response.PaymentDetailResponse;
import com.highdev.breazelife.modules.payment.exceptions.PaymentAccessDeniedException;
import com.highdev.breazelife.modules.payment.exceptions.PaymentDateRangeException;
import com.highdev.breazelife.modules.payment.exceptions.PaymentNotFoundException;
import com.highdev.breazelife.modules.payment.exceptions.PayrollNotFoundException;
import com.highdev.breazelife.modules.payment.repository.PaymentRepository;
import com.highdev.breazelife.modules.payment.repository.PaymentRepository.PayrollSummaryProjection;
import com.highdev.breazelife.modules.quote.entity.Quote;
import com.highdev.breazelife.modules.quote.repository.QuoteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
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
    private final FundsService fundsService;
    private final EmployerRepository employerRepository;
    private final PaymentRepository paymentRepository;
    private final QuoteRepository quoteRepository;
    private final AccountRepository accountRepository;
 
    public PayrollService(ContractRepository contractRepository,
                          FundsService fundsService,
                          EmployerRepository employerRepository,
                          PaymentRepository paymentRepository,
                          QuoteRepository quoteRepository,
                          AccountRepository accountRepository) {
        this.contractRepository = contractRepository;
        this.fundsService = fundsService;
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

        // Validar fondos — publica InsufficientFundsEvent si no alcanzan
        try {
            fundsService.validateFunds(employerUserId,
                new ValidateFundsRequest(totalNetSalary, totalEmployerContrib));
        } catch (InsufficientFundsException ex) {
            BigDecimal payrollBalance = getFundBalance(employerUserId, FundType.PAYROLL);
            BigDecimal pensionBalance = getFundBalance(employerUserId, FundType.PENSION);
            throw new PayrollInsufficientFundsException(
                payrollBalance, totalNetSalary, pensionBalance, totalEmployerContrib);
        }

        YearMonth ym = YearMonth.parse(request.getPeriod(), DateTimeFormatter.ofPattern("yyyy-MM"));
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime paymentDate = ym.equals(YearMonth.from(now))
            ? now
            : ym.atEndOfMonth().atTime(now.toLocalTime());

        List<PaymentResultDTO> paymentResults = new ArrayList<>();

        for (int i = 0; i < contracts.size(); i++) {
            Contract contract = contracts.get(i);
            EmployeePayrollPreviewResponse detail = details.get(i);

            // a. Persistir Payment
            Payment payment = new Payment();
            payment.setId(UUID.randomUUID().toString());
            payment.setContract(contract);
            payment.setNetSalary(detail.getNetSalary());
            payment.setDate(paymentDate);
            paymentRepository.save(payment);

            // b. Crear Quote vinculada al Payment y a la Account del afiliado
            Account account = accountRepository
                .findByAffiliateUserId(contract.getAffiliate().getUserId())
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Account not found for affiliate"));

            Quote quote = new Quote();
            String quoteId = "QTE-" + UUID.randomUUID().toString().replace("-", "").substring(0, 15).toUpperCase();
            quote.setId(quoteId);
            quote.setAccount(account);
            quote.setPayment(payment);
            quote.setEmployerContrib(detail.getEmployerPensionContrib());
            quote.setAffiliateContrib(detail.getEmployeePensionDeduction());
            quote.setDaysContributed(30);
            quote.setContribDate(paymentDate);
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

        // Debitar fondos y registrar movimientos OUTCOME
        fundsService.deductFunds(employerUserId,
            new DeductFundsRequest(totalNetSalary, totalEmployerContrib, request.getPeriod()));

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
        response.setPayrollFundRemaining(getFundBalance(employerUserId, FundType.PAYROLL));
        response.setPensionFundRemaining(getFundBalance(employerUserId, FundType.PENSION));

        return response;
    }

    // ─── History ─────────────────────────────────────────────────────────────

    public PayrollHistoryResponse getHistory(String employerUserId, int page, int limit, String period, String status) {
        findEmployer(employerUserId);

        // status filter: only PROCESSED payrolls exist (execute is transactional)
        if (status != null && !status.equalsIgnoreCase("PROCESSED")) {
            PayrollHistoryResponse empty = new PayrollHistoryResponse();
            empty.setItems(List.of());
            empty.setPagination(new PayrollHistoryResponse.Pagination(page, limit, 0));
            return empty;
        }

        Page<PayrollSummaryProjection> resultPage = paymentRepository.findPayrollSummaries(
            employerUserId,
            period,
            PageRequest.of(page - 1, limit)
        );

        List<PayrollHistoryItemDTO> items = resultPage.getContent().stream()
            .map(proj -> {
                BigDecimal netSalary = proj.getTotalNetSalary() != null ? proj.getTotalNetSalary() : BigDecimal.ZERO;
                // Derive employer contrib (12%) and total pension contrib (16%) from net salary
                BigDecimal ibc             = netSalary.divide(NET_SALARY_RATE, 10, RoundingMode.HALF_UP);
                BigDecimal pensionContrib  = ibc.multiply(TOTAL_CONTRIBUTION_RATE).setScale(2, RoundingMode.HALF_UP);
                BigDecimal employerContrib = ibc.multiply(EMPLOYER_CONTRIBUTION_RATE).setScale(2, RoundingMode.HALF_UP);
                BigDecimal totalDebit      = netSalary.add(employerContrib).setScale(2, RoundingMode.HALF_UP);

                PayrollHistoryItemDTO item = new PayrollHistoryItemDTO();
                item.setPayrollId(proj.getPeriod());
                item.setPeriod(proj.getPeriod());
                item.setTotalEmployees(proj.getTotalEmployees() != null ? proj.getTotalEmployees() : 0L);
                item.setTotalNetSalary(netSalary.setScale(2, RoundingMode.HALF_UP));
                item.setTotalPensionContrib(pensionContrib);
                item.setTotalDebit(totalDebit);
                item.setStatus("PROCESSED");
                item.setExecutedAt(proj.getExecutedAt());
                return item;
            })
            .toList();

        PayrollHistoryResponse response = new PayrollHistoryResponse();
        response.setItems(items);
        response.setPagination(new PayrollHistoryResponse.Pagination(page, limit, resultPage.getTotalElements()));
        return response;
    }

    // ─── Detail ───────────────────────────────────────────────────────────────

    public PayrollDetailResponse getDetail(String employerUserId, String payrollId) {
        Employer employer = findEmployer(employerUserId);

        List<Payment> payments = paymentRepository.findByEmployerAndPeriod(employerUserId, payrollId);
        if (payments.isEmpty()) {
            throw new PayrollNotFoundException();
        }

        BigDecimal totalGross              = BigDecimal.ZERO;
        BigDecimal totalNetSalary          = BigDecimal.ZERO;
        BigDecimal totalEmployerContrib    = BigDecimal.ZERO;
        BigDecimal totalAffiliateContrib   = BigDecimal.ZERO;

        List<PayrollDetailPaymentDTO> paymentDTOs = new ArrayList<>();

        for (Payment payment : payments) {
            Quote quote = quoteRepository.findByPayment_Id(payment.getId()).orElse(null);

            BigDecimal employerContrib  = quote != null ? quote.getEmployerContrib()  : BigDecimal.ZERO;
            BigDecimal affiliateContrib = quote != null ? quote.getAffiliateContrib() : BigDecimal.ZERO;
            BigDecimal gross = employerContrib.add(affiliateContrib)
                .divide(TOTAL_CONTRIBUTION_RATE, 10, RoundingMode.HALF_UP)
                .setScale(2, RoundingMode.HALF_UP);

            PayrollDetailPaymentDTO dto = new PayrollDetailPaymentDTO();
            dto.setPaymentId(payment.getId());
            dto.setContractId(payment.getContract().getId());
            dto.setAffiliateName(
                payment.getContract().getAffiliate().getUser().getFirstName() + " " +
                payment.getContract().getAffiliate().getUser().getLastName()
            );
            dto.setDocument(payment.getContract().getAffiliate().getDocument());
            dto.setPosition(payment.getContract().getPosition());
            dto.setBaseSalary(gross);
            dto.setEmployeePensionDeduction(affiliateContrib.setScale(2, RoundingMode.HALF_UP));
            dto.setNetSalary(payment.getNetSalary());
            dto.setEmployerPensionContrib(employerContrib.setScale(2, RoundingMode.HALF_UP));
            dto.setTotalPensionContrib(employerContrib.add(affiliateContrib).setScale(2, RoundingMode.HALF_UP));
            dto.setDaysContributed(quote != null ? quote.getDaysContributed() : 30);
            dto.setQuoteId(quote != null ? quote.getId() : null);
            dto.setQuoteStatus(quote != null ? quote.getStatus().name() : null);
            dto.setStatus("PROCESSED");
            paymentDTOs.add(dto);

            totalGross            = totalGross.add(gross);
            totalNetSalary        = totalNetSalary.add(payment.getNetSalary());
            totalEmployerContrib  = totalEmployerContrib.add(employerContrib);
            totalAffiliateContrib = totalAffiliateContrib.add(affiliateContrib);
        }

        PayrollDetailResponse.Totals totals = new PayrollDetailResponse.Totals();
        totals.setTotalEmployees(payments.size());
        totals.setTotalGrossSalary(totalGross.setScale(2, RoundingMode.HALF_UP));
        totals.setTotalNetSalary(totalNetSalary.setScale(2, RoundingMode.HALF_UP));
        totals.setTotalEmployerPensionContrib(totalEmployerContrib.setScale(2, RoundingMode.HALF_UP));
        totals.setTotalEmployeePensionDeduction(totalAffiliateContrib.setScale(2, RoundingMode.HALF_UP));
        totals.setTotalPensionContrib(totalEmployerContrib.add(totalAffiliateContrib).setScale(2, RoundingMode.HALF_UP));
        totals.setTotalDebit(totalNetSalary.add(totalEmployerContrib).setScale(2, RoundingMode.HALF_UP));

        PayrollDetailResponse response = new PayrollDetailResponse();
        response.setPayrollId(payrollId);
        response.setPeriod(payrollId);
        response.setEmployerId(employerUserId);
        response.setCompanyName(employer.getCompanyName());
        response.setStatus("PROCESSED");
        response.setExecutedAt(payments.get(0).getDate());
        response.setPayments(paymentDTOs);
        response.setTotals(totals);
        return response;
    }

    // ─── Payment detail (Employer + Affiliate) ───────────────────────────────

    public PaymentDetailResponse getPaymentDetail(String userId, String userRole, String paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(PaymentNotFoundException::new);

        if ("AFFILIATE".equals(userRole)) {
            if (!payment.getContract().getAffiliate().getUserId().equals(userId)) {
                throw new PaymentAccessDeniedException();
            }
        } else {
            if (!payment.getContract().getEmployer().getUserId().equals(userId)) {
                throw new PaymentAccessDeniedException();
            }
        }

        Quote quote = quoteRepository.findByPayment_Id(paymentId).orElse(null);

        BigDecimal employerContrib  = quote != null ? quote.getEmployerContrib()  : BigDecimal.ZERO;
        BigDecimal affiliateContrib = quote != null ? quote.getAffiliateContrib() : BigDecimal.ZERO;
        BigDecimal baseSalary = employerContrib.add(affiliateContrib)
            .divide(TOTAL_CONTRIBUTION_RATE, 10, RoundingMode.HALF_UP)
            .setScale(2, RoundingMode.HALF_UP);

        String period = payment.getDate().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        PaymentDetailResponse response = new PaymentDetailResponse();
        response.setPaymentId(payment.getId());
        response.setPeriod(period);
        response.setCompanyName(payment.getContract().getEmployer().getCompanyName());
        response.setAffiliateName(
            payment.getContract().getAffiliate().getUser().getFirstName() + " " +
            payment.getContract().getAffiliate().getUser().getLastName()
        );
        response.setDocument(payment.getContract().getAffiliate().getDocument());
        response.setPosition(payment.getContract().getPosition());
        response.setBaseSalary(baseSalary);
        response.setEmployeePensionDeduction(affiliateContrib.setScale(2, RoundingMode.HALF_UP));
        response.setNetSalary(payment.getNetSalary());
        response.setEmployerPensionContrib(employerContrib.setScale(2, RoundingMode.HALF_UP));
        response.setTotalPensionContrib(employerContrib.add(affiliateContrib).setScale(2, RoundingMode.HALF_UP));
        response.setDaysContributed(quote != null && quote.getDaysContributed() != null ? quote.getDaysContributed() : 30);
        response.setQuoteId(quote != null ? quote.getId() : null);
        response.setQuoteStatus(quote != null ? quote.getStatus().name() : null);
        response.setStatus("PROCESSED");
        response.setPaidAt(payment.getDate());
        return response;
    }

    // ─── Affiliate payment history ────────────────────────────────────────────

    public AffiliatePaymentHistoryResponse getAffiliatePayments(
            String affiliateUserId, int page, int limit,
            LocalDate from, LocalDate to, String status) {

        if (status != null && !status.equalsIgnoreCase("PROCESSED")) {
            AffiliatePaymentHistoryResponse empty = new AffiliatePaymentHistoryResponse();
            empty.setItems(List.of());
            empty.setPagination(new AffiliatePaymentHistoryResponse.Pagination(page, limit, 0));
            return empty;
        }

        if (from != null && to != null && from.isAfter(to)) {
            throw new PaymentDateRangeException();
        }

        Page<Payment> resultPage;
        PageRequest pageable = PageRequest.of(page - 1, limit);

        if (from != null && to != null) {
            LocalDateTime fromDt = from.atStartOfDay();
            LocalDateTime toDt   = to.atTime(23, 59, 59);
            resultPage = paymentRepository.findByContractAffiliateUserIdAndDateBetweenOrderByDateDesc(
                affiliateUserId, fromDt, toDt, pageable);
        } else {
            resultPage = paymentRepository.findByContractAffiliateUserIdOrderByDateDesc(affiliateUserId, pageable);
        }

        List<AffiliatePaymentItemDTO> items = resultPage.getContent().stream()
            .map(p -> {
                BigDecimal net = p.getNetSalary() != null ? p.getNetSalary() : BigDecimal.ZERO;
                BigDecimal ibc            = net.divide(NET_SALARY_RATE, 10, RoundingMode.HALF_UP);
                BigDecimal pensionContrib = ibc.multiply(TOTAL_CONTRIBUTION_RATE).setScale(2, RoundingMode.HALF_UP);
                BigDecimal base           = ibc.setScale(2, RoundingMode.HALF_UP);
                String period = p.getDate().format(DateTimeFormatter.ofPattern("yyyy-MM"));

                AffiliatePaymentItemDTO dto = new AffiliatePaymentItemDTO();
                dto.setPaymentId(p.getId());
                dto.setPeriod(period);
                dto.setCompanyName(p.getContract().getEmployer().getCompanyName());
                dto.setPosition(p.getContract().getPosition());
                dto.setBaseSalary(base);
                dto.setNetSalary(net.setScale(2, RoundingMode.HALF_UP));
                dto.setTotalPensionContrib(pensionContrib);
                dto.setStatus("PROCESSED");
                dto.setPaidAt(p.getDate());
                return dto;
            })
            .toList();

        AffiliatePaymentHistoryResponse response = new AffiliatePaymentHistoryResponse();
        response.setItems(items);
        response.setPagination(new AffiliatePaymentHistoryResponse.Pagination(page, limit, resultPage.getTotalElements()));
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
        try {
            FundResponse res = fundsService.getFundByType(employerUserId, type);
            return res != null ? res.balance() : BigDecimal.ZERO;
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }
}

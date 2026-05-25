package com.highdev.breazelife.modules.employer.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SalaryHistoryResponse {

    private String historyId;
    private String contractId;
    private LocalDateTime date;
    private String action;
    private String position;
    private BigDecimal salary;

    public String getHistoryId() { return historyId; }
    public void setHistoryId(String historyId) { this.historyId = historyId; }

    public String getContractId() { return contractId; }
    public void setContractId(String contractId) { this.contractId = contractId; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public BigDecimal getSalary() { return salary; }
    public void setSalary(BigDecimal salary) { this.salary = salary; }
}
package com.highdev.breazelife.modules.history.entity;

import com.highdev.breazelife.modules.contract.entity.Contract;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "update_history")
public class UpdateHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "contract", nullable = false)
    private Contract contract;

    private LocalDateTime date;

    @Column(length = 255)
    private String action;

    @Column(length = 50)
    private String position;

    @Column(precision = 15, scale = 2)
    private BigDecimal salary;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Contract getContract() { return contract; }
    public void setContract(Contract contract) { this.contract = contract; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public BigDecimal getSalary() { return salary; }
    public void setSalary(BigDecimal salary) { this.salary = salary; }
}

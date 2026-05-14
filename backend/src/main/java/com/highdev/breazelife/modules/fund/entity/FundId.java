package com.highdev.breazelife.modules.fund.entity;

import com.highdev.breazelife.modules.fund.enums.FundType;
import java.io.Serializable;
import java.util.Objects;

public class FundId implements Serializable {

    private String employerId;
    private FundType type;

    public FundId() {}

    public FundId(String employerId, FundType type) {
        this.employerId = employerId;
        this.type = type;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FundId that)) return false;
        return Objects.equals(employerId, that.employerId) && Objects.equals(type, that.type);
    }

    @Override
    public int hashCode() {
        return Objects.hash(employerId, type);
    }

    public String getEmployerId() { return employerId; }
    public void setEmployerId(String employerId) { this.employerId = employerId; }

    public FundType getType() { return type; }
    public void setFundType(FundType type) { this.type = type; }
}

package com.highdev.breazelife.modules.config.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "system_config")
public class SystemConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "`key`", length = 100, unique = true)
    private String key;

    @Column(length = 100)
    private String value;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}

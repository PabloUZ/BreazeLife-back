-- ============================================
-- DATABASE
-- ============================================

-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
    id              CHAR(36) PRIMARY KEY,
    first_name      VARCHAR(30) NOT NULL,
    last_name       VARCHAR(30) NOT NULL,
    role            ENUM('AFFILIATE','EMPLOYER','ADMIN') NOT NULL,
    verified        BOOLEAN DEFAULT FALSE,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password        VARCHAR(255) NOT NULL
);

-- ============================================
-- ADMINS
-- ============================================
CREATE TABLE admins (
    user_id CHAR(36) PRIMARY KEY,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================
-- EMPLOYERS
-- ============================================
CREATE TABLE employers (
    user_id            CHAR(36) PRIMARY KEY,
    nit                VARCHAR(20) UNIQUE NOT NULL,
    company_name       VARCHAR(50) NOT NULL,
    sector             VARCHAR(100),
    name_legal_rep     VARCHAR(50),
    id_legal_rep       VARCHAR(20),
    status             ENUM('ACTIVE','SUSPENDED','INACTIVE') DEFAULT 'ACTIVE',
    suspended_reason   TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================
-- AFFILIATES
-- ============================================
CREATE TABLE affiliates (
    user_id            CHAR(36) PRIMARY KEY,
    document           VARCHAR(20) UNIQUE NOT NULL,
    birth_date         DATE,
    phone_number       VARCHAR(15) UNIQUE,
    affiliation_date   DATE,
    status             ENUM('ACTIVE','SUSPENDED','INACTIVE') DEFAULT 'ACTIVE',
    suspended_reason   TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================
-- ACCOUNTS (1:1 con affiliates)
-- ============================================
CREATE TABLE accounts (
    id              VARCHAR(20) PRIMARY KEY,
    affiliate       CHAR(36) UNIQUE,
    balance         DECIMAL(15,2) DEFAULT 0,
    account_type    ENUM('CONSERVATIVE','MODERATE','RISKY'),
    quoted_days     INT DEFAULT 0,
    FOREIGN KEY (affiliate) REFERENCES affiliates(user_id)
);

-- ============================================
-- PROFITABILITY HISTORY
-- ============================================
CREATE TABLE profitability_history (
    id          VARCHAR(20) PRIMARY KEY,
    account     VARCHAR(20),
    profit      DECIMAL(15,2),
    date        DATE,
    FOREIGN KEY (account) REFERENCES accounts(id)
);

-- ============================================
-- FUNDS (máximo 2 por employer vía ENUM)
-- ============================================
CREATE TABLE funds (
    employer_id CHAR(36),
    type        ENUM('PAYROLL','PENSION'),
    balance     DECIMAL(15,2) DEFAULT 0,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (employer_id, type),
    FOREIGN KEY (employer_id) REFERENCES employers(user_id)
);

-- ============================================
-- MOVEMENTS
-- ============================================
CREATE TABLE movements (
    id          CHAR(36) PRIMARY KEY,
    funds_id    CHAR(36) NOT NULL,
    fund_type   ENUM('PAYROLL','PENSION') NOT NULL,
    type        ENUM('INCOME','OUTCOME'),
    amount      DECIMAL(15,2),
    date        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (funds_id, fund_type) REFERENCES funds(employer_id, type)
);

-- ============================================
-- CONTRACTS
-- ============================================
CREATE TABLE contracts (
    id              CHAR(36) PRIMARY KEY,
    affiliate       CHAR(36) NOT NULL,
    employer        CHAR(36) NOT NULL,
    base_salary     DECIMAL(15,2),
    position        VARCHAR(50),
    start_date      DATE,
    end_date        DATE,
    FOREIGN KEY (affiliate) REFERENCES affiliates(user_id),
    FOREIGN KEY (employer) REFERENCES employers(user_id)
);

-- ============================================
-- PAYMENTS
-- ============================================
CREATE TABLE payments (
    id              CHAR(36) PRIMARY KEY,
    contract_id     CHAR(36) NOT NULL,
    net_salary      DECIMAL(15,2),
    date            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id)
);

-- ============================================
-- UPDATE HISTORY
-- ============================================
CREATE TABLE update_history (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    contract    CHAR(36) NOT NULL,
    date        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action      VARCHAR(255),
    position    VARCHAR(50),
    salary      DECIMAL(15,2),
    FOREIGN KEY (contract) REFERENCES contracts(id)
);

-- ============================================
-- QUOTES
-- ============================================
CREATE TABLE quotes (
    id                  VARCHAR(20) PRIMARY KEY,
    account             VARCHAR(20),
    payment             CHAR(36) UNIQUE,
    employer_contrib    DECIMAL(15,2),
    affiliate_contrib   DECIMAL(15,2),
    days_contributed    INT,
    contrib_date        TIMESTAMP,
    status              ENUM('PENDING','ACCEPTED','REJECTED') DEFAULT 'PENDING',
    reviewed_by         CHAR(36),
    reviewed_at         TIMESTAMP,
    comment             TEXT,
    FOREIGN KEY (account) REFERENCES accounts(id),
    FOREIGN KEY (payment) REFERENCES payments(id),
    FOREIGN KEY (reviewed_by) REFERENCES admins(user_id)
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
    id          VARCHAR(20) PRIMARY KEY,
    user        CHAR(36),
    message     TEXT,
    read        BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user) REFERENCES users(id)
);

-- ============================================
-- SYSTEM CONFIG
-- ============================================
CREATE TABLE system_config (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    `key`   VARCHAR(100) UNIQUE,
    value   VARCHAR(100)
);

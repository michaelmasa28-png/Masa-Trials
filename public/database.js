
-- ==========================================================================
-- PRODUCTION DATABASE SCHEMA: KINGDOM WAYS CHURCH cms_finance
-- ==========================================================================

CREATE DATABASE IF NOT EXISTS church_cms_finance;
USE church_cms_finance;

-- 1. CHURCH ACCOUNTS TABLE SETUP
CREATE TABLE IF NOT EXISTS church_accounts (
    account_key VARCHAR(50) PRIMARY KEY,
    account_name VARCHAR(100) NOT NULL,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. SECURE TRANSACTION LEDGER TABLE SETUP
CREATE TABLE IF NOT EXISTS church_ledger (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tx_id VARCHAR(50) UNIQUE NOT NULL,
    tx_date VARCHAR(25) NOT NULL,
    tx_type ENUM('income', 'expense') NOT NULL,
    category VARCHAR(100) NOT NULL,
    account_key VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    tx_status VARCHAR(20) DEFAULT 'Completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_key) REFERENCES church_accounts(account_key) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. SPEED & SEARCH OPTIMISATION INDEXES
CREATE INDEX idx_ledger_tx_id ON church_ledger(tx_id);
CREATE INDEX idx_ledger_type ON church_ledger(tx_type);
CREATE INDEX idx_ledger_account ON church_ledger(account_key);

-- 4. INSERT SECURE SYSTEM ACCOUNT DEFAULTS
INSERT INTO church_accounts (account_key, account_name, balance) VALUES
('main', 'Main Church Account', 750000.00),
('bank', 'Bank Account', 1200000.00),
('cash', 'Cash Office', 45000.00),
('mpesa', 'M-Pesa Account', 180000.00),
('petty', 'Petty Cash', 8500.00)
ON DUPLICATE KEY UPDATE account_name=VALUES(account_name);

-- 5. SEED INITIAL LOG ENTRY TO VERIFY ENGINE CORRELATION
INSERT INTO church_ledger (tx_id, tx_date, tx_type, category, account_key, amount, tx_status) VALUES
('tx-2026-10001', '15 Jul 2026', 'income', 'Tithe', 'bank', 12000.00, 'Completed'),
('tx-2026-10002', '14 Jul 2026', 'expense', 'Electricity', 'main', 5000.00, 'Completed')
ON DUPLICATE KEY UPDATE tx_id=tx_id;

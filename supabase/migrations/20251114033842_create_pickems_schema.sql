-- ###########################
-- 1. CREAREA TABELELOR
-- ###########################

-- Tabela admin_config
CREATE TABLE IF NOT EXISTS admin_config (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `key` VARCHAR(255) UNIQUE NOT NULL,       -- "key" este cuvânt rezervat, se folosesc ghilimele inverse
    `value` JSON NOT NULL DEFAULT ('{}'),     -- Folosim tipul JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela tournament_settings
CREATE TABLE IF NOT EXISTS tournament_settings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    stage VARCHAR(50) NOT NULL DEFAULT 'groups',
    status VARCHAR(50) NOT NULL DEFAULT 'upcoming',
    teams JSON NOT NULL DEFAULT ('[]'),
    matches JSON NOT NULL DEFAULT ('[]'),
    bracket_data JSON NOT NULL DEFAULT ('{}'),
    start_date DATETIME,                      -- DATETIME înlocuiește timestamptz
    end_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela user_data
CREATE TABLE IF NOT EXISTS user_data (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    -- Presupunem că sistemul extern de autentificare (ex: auth.users) folosește UUID-uri, deci CHAR(36)
    -- Nu putem face o referință externă la un tabel inexistent/extern, deci omitem FK (REFERENCES auth.users)
    user_id CHAR(36) NOT NULL, 
    username VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    picks JSON NOT NULL DEFAULT ('{}'),
    score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- ###########################
-- 2. ADĂUGARE INDEXURI
-- ###########################

-- Indexuri pentru user_data
CREATE INDEX idx_user_data_user_id ON user_data(user_id);
CREATE INDEX idx_user_data_score ON user_data(score DESC);

-- Indexuri pentru tournament_settings
CREATE INDEX idx_tournament_settings_status ON tournament_settings(status);
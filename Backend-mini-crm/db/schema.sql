
CREATE DATABASE IF NOT EXISTS mini_crm
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mini_crm;

-- ─── Admins ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,          -- bcrypt hash
  name       VARCHAR(100) NOT NULL,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─── Leads ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  phone      VARCHAR(30),
  source     ENUM('Contact Form','LinkedIn','Referral','Cold Email','Other') DEFAULT 'Other',
  status     ENUM('new','contacted','converted') DEFAULT 'new',
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── Notes ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
  id         INT       AUTO_INCREMENT PRIMARY KEY,
  lead_id    INT       NOT NULL,
  content    TEXT      NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

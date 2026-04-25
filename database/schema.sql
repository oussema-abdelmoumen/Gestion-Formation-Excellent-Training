-- ============================================================
-- Gestion de Formation - ISI Tunis El Manar
-- Script d'initialisation de la base de données
-- ============================================================

CREATE DATABASE IF NOT EXISTS gestion_formation
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gestion_formation;

-- Table: role
CREATE TABLE IF NOT EXISTS role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL
);

-- Table: utilisateur
CREATE TABLE IF NOT EXISTS utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    id_role INT NOT NULL,
    FOREIGN KEY (id_role) REFERENCES role(id)
);

-- Table: domaine
CREATE TABLE IF NOT EXISTS domaine (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(100) NOT NULL
);

-- Table: profil
CREATE TABLE IF NOT EXISTS profil (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(100) NOT NULL
);

-- Table: structure
CREATE TABLE IF NOT EXISTS structure (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(150) NOT NULL
);

-- Table: employeur
CREATE TABLE IF NOT EXISTS employeur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_employeur VARCHAR(150) NOT NULL
);

-- Table: formateur
CREATE TABLE IF NOT EXISTS formateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    tel VARCHAR(20),
    type VARCHAR(20) NOT NULL,
    id_employeur INT,
    FOREIGN KEY (id_employeur) REFERENCES employeur(id)
);

-- Table: participant
CREATE TABLE IF NOT EXISTS participant (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    tel VARCHAR(20),
    id_structure INT NOT NULL,
    id_profil INT NOT NULL,
    FOREIGN KEY (id_structure) REFERENCES structure(id),
    FOREIGN KEY (id_profil) REFERENCES profil(id)
);

-- Table: formation
CREATE TABLE IF NOT EXISTS formation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    annee INT NOT NULL,
    duree INT NOT NULL,
    budget DOUBLE,
    id_domaine INT NOT NULL,
    id_formateur INT,
    FOREIGN KEY (id_domaine) REFERENCES domaine(id),
    FOREIGN KEY (id_formateur) REFERENCES formateur(id)
);

-- Table junction: formation <-> participant (Many-to-Many)
CREATE TABLE IF NOT EXISTS formation_participant (
    id_formation BIGINT NOT NULL,
    id_participant INT NOT NULL,
    PRIMARY KEY (id_formation, id_participant),
    FOREIGN KEY (id_formation) REFERENCES formation(id) ON DELETE CASCADE,
    FOREIGN KEY (id_participant) REFERENCES participant(id) ON DELETE CASCADE
);

-- ============================================================
-- DONNÉES INITIALES
-- ============================================================

-- Roles
INSERT IGNORE INTO role (id, nom) VALUES
(1, 'ADMIN'),
(2, 'RESPONSABLE'),
(3, 'UTILISATEUR');

-- Admin par défaut (password: admin123)
INSERT IGNORE INTO utilisateur (id, login, password, id_role) VALUES
(1, 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1),
(2, 'responsable', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2),
(3, 'utilisateur', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3);

-- Domaines
INSERT IGNORE INTO domaine (libelle) VALUES
('Informatique'),
('Finance'),
('Mécanique'),
('Management'),
('Juridique'),
('Ressources Humaines');

-- Profils
INSERT IGNORE INTO profil (libelle) VALUES
('Informaticien (Bac+5)'),
('Informaticien (Bac+3)'),
('Gestionnaire'),
('Juriste'),
('Technicien Supérieur'),
('Mécanicien');

-- Structures
INSERT IGNORE INTO structure (libelle) VALUES
('Direction Centrale'),
('Direction Régionale Nord'),
('Direction Régionale Sud'),
('Direction Régionale Est'),
('Direction Régionale Ouest');

-- Employeurs
INSERT IGNORE INTO employeur (nom_employeur) VALUES
('Green Building'),
('Société Externe A'),
('Société Externe B');

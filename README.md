# 🎓 Excellent Training — Gestion de Formation

> Application web complète de gestion des cycles de formation développée dans le cadre d'un mini-projet académique.
> **ISI — Université de Tunis El Manar — 2025/2026**

---

## 🖥️ Aperçu

| Page | Description |
|------|-------------|
| Page d'accueil | Landing page de présentation |
| Connexion / Inscription | Authentification avec vérification email |
| Dashboard | Statistiques et graphiques (Admin/Responsable) |
| Formations | CRUD complet avec export Excel |
| Formateurs / Participants | Gestion des intervenants |

---

## 📁 Structure du projet

```
gestion-formation/
├── backend/          → Spring Boot 3.2 (Java 17, Maven)
├── frontend/         → Angular 17 (TypeScript)
├── database/         → Script SQL d'initialisation
└── README.md
```

---

## 🛠️ Stack Technologique

**Backend**

![Java](https://img.shields.io/badge/Java-17-orange?logo=java)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-green?logo=springboot)
![MySQL](https://img.shields.io/badge/MySQL-8-blue?logo=mysql)
![JWT](https://img.shields.io/badge/JWT-Auth-black?logo=jsonwebtokens)

**Frontend**

![Angular](https://img.shields.io/badge/Angular-17-red?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)

---

## ⚙️ Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Java JDK | 17+ |
| Maven | 3.6+ |
| Node.js | 18+ |
| npm | 9+ |
| Angular CLI | `npm install -g @angular/cli` |
| MySQL | 8+ |

---

## 🚀 Installation & Lancement

### 1️⃣ Base de données MySQL

```sql
-- Dans MySQL Workbench ou terminal MySQL :
source database/schema.sql
```

Cela crée la base `gestion_formation` avec toutes les tables et les données initiales.

### 2️⃣ Configurer le backend

Ouvrez `backend/src/main/resources/application.properties` et renseignez votre mot de passe MySQL :

```properties
spring.datasource.password=VOTRE_MDP_MYSQL
```

> ⚠️ Ne committez jamais ce fichier avec vos vraies credentials.

### 3️⃣ Lancer le Backend

```bash
cd backend
mvn spring-boot:run
```

✅ API disponible sur : **http://localhost:8080**

### 4️⃣ Lancer le Frontend

Ouvrez un **nouveau terminal** :

```bash
cd frontend
npm install
ng serve
```

✅ Application disponible sur : **http://localhost:4200**

---

## 🔑 Comptes par défaut

| Login | Mot de passe | Rôle | Accès |
|-------|-------------|------|-------|
| `admin` | `admin123` | ADMIN | Accès total (CRUD tout) |
| `responsable` | `admin123` | RESPONSABLE | Lecture seule + Dashboard |
| `utilisateur` | `admin123` | UTILISATEUR | CRUD formations |

---

## 🔐 Sécurité

- **JWT** (JSON Web Tokens) — authentification stateless, expiration 24h
- **BCrypt** — hashage sécurisé des mots de passe
- **Vérification email** — activation de compte obligatoire pour l'auto-inscription
- **CAPTCHA** — protection contre les bots à l'inscription
- **RBAC** — contrôle d'accès basé sur les rôles (3 niveaux)

---

## 🌐 Principaux Endpoints API

| Méthode | URL | Description | Rôle requis |
|---------|-----|-------------|-------------|
| POST | `/api/auth/login` | Connexion | Public |
| POST | `/api/auth/register` | Inscription | Public |
| GET | `/api/auth/verify?token=` | Vérification email | Public |
| GET | `/api/formations` | Liste des formations | Tous |
| POST | `/api/formations` | Créer une formation | ADMIN / UTILISATEUR |
| GET | `/api/formations/stats/domaine` | Stats par domaine | Tous |
| GET | `/api/formations/export/excel` | Export Excel | Tous |
| GET | `/api/utilisateurs` | Liste utilisateurs | ADMIN |

---

## 📊 Fonctionnalités

- ✅ Authentification JWT avec vérification email
- ✅ Gestion des rôles (ADMIN, RESPONSABLE, UTILISATEUR)
- ✅ CRUD Formations, Formateurs, Participants
- ✅ Affectation de participants à une formation (Many-to-Many)
- ✅ Dashboard avec graphiques statistiques
- ✅ Export Excel des formations (Apache POI)
- ✅ Mode sombre / clair
- ✅ Validation des formulaires (frontend + backend)
- ✅ Page d'accès refusé (403)
- ✅ Email de vérification HTML stylisé

---

## 📄 Licence

Projet académique — ISI Tunis El Manar © 2026

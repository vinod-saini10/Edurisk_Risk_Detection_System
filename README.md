<div align="center">

<img src="frontend/public/EduRisk-logo.svg" alt="EduRisk Logo" width="130" />

# 🎓 EduRisk — Early Academic Risk Detection System

### AI-Powered Student Performance Prediction with Explainable Insights

[![Python](https://img.shields.io/badge/Python-3.10-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0.3-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![APIFlask](https://img.shields.io/badge/APIFlask-2.3.2-blueviolet?style=for-the-badge)](https://apiflask.com)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5.1-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0.3-FF6600?style=for-the-badge)](https://xgboost.readthedocs.io)
[![SHAP](https://img.shields.io/badge/SHAP-0.45.0-00B4D8?style=for-the-badge)](https://shap.readthedocs.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

**EduRisk** is a production-ready, full-stack AI web application that predicts a student's academic risk level using a dual-model Machine Learning ensemble (Random Forest + XGBoost). It delivers Explainable AI (XAI) insights via SHAP, what-if scenario simulations, personalized academic recommendations, and a comprehensive admin analytics dashboard — all secured with JWT authentication and OTP email verification.

[🚀 Features](#-features) · [🏗️ Architecture](#️-architecture) · [📁 Folder Structure](#-folder-structure) · [🛠️ Installation](#️-installation) · [📡 API Reference](#-api-reference) · [🤖 Machine Learning](#-machine-learning-pipeline) · [📸 Screenshots](#-screenshots) · [🚢 Deployment](#-deployment)

---

🚀 **Live Demo** — `https://eduriskdetectionsystem.vercel.app/` _(update after deployment)_

📚 **Swagger API Docs** — `https://edurisk-risk-detection-system.onrender.com/docs` _(update after deployment)_

💻 **GitHub Repository** — [github.com/vinod-saini10/Edurisk_Risk_Detection_System](https://github.com/vinod-saini10/Edurisk_Risk_Detection_System)

</div>

---

## 🚀 Project Highlights

✔ **AI-Powered Academic Risk Prediction** — Predict final exam score and risk tier from 5 academic indicators

✔ **Random Forest + XGBoost Ensemble** — Dual-model pipeline averaging predictions for higher accuracy

✔ **SHAP Explainable AI** — Per-instance SHAP values surface the exact features driving every prediction

✔ **4-Tier Risk Classification** — No Risk / Low Risk / Medium Risk / High Risk with severity labels

✔ **What-If Simulation Engine** — Auto-simulates improved scores when weak areas are addressed

✔ **JWT Authentication** — Stateless, 2-hour access tokens with role-based claims

✔ **OTP Email Verification** — 6-digit OTP sent via Resend API; accounts gate on verification

✔ **Student Dashboard** — Personal analytics: total predictions, average score, risk breakdown, trend charts

✔ **Admin Dashboard** — System-wide analytics, top high-risk students, AI insights, model metrics

✔ **Bulk CSV Prediction** — Upload a CSV of students for batch inference; results saved to DB and returned as JSON

✔ **Prediction History** — Full history per student with date, score, risk level, and confidence value

✔ **Role-Based Access Control** — Decorator-enforced `@admin_required()` guarding all admin routes

✔ **OpenAPI / Swagger UI** — Auto-generated interactive documentation via APIFlask at `/docs`

✔ **Docker Compose** — Single-command full-stack deployment with MySQL 8, Flask, and React services

✔ **Render.com Ready** — Backend (Gunicorn) and frontend (static build) separately deployable

---

## 🛠️ Tech Stack

| Layer                 | Technology                 | Version       |
| --------------------- | -------------------------- | ------------- |
| **Frontend**          | React + React Router v6    | 18.2 / 6.22   |
| **HTTP Client**       | Axios                      | 1.6.7         |
| **Charts**            | Recharts                   | 2.12          |
| **Backend**           | Flask + APIFlask           | 3.0.3 / 2.3.2 |
| **Database**          | MySQL                      | 8.0           |
| **ORM / Driver**      | mysql-connector-python     | 9.0.0         |
| **Machine Learning**  | scikit-learn Random Forest | 1.5.1         |
| **Gradient Boosting** | XGBoost                    | 2.0.3         |
| **Explainability**    | SHAP                       | 0.45.0        |
| **Authentication**    | Flask-JWT-Extended         | 4.6.0         |
| **Password Hashing**  | Flask-Bcrypt               | 1.0.1         |
| **Email**             | Resend API                 | 2.32.2        |
| **WSGI Server**       | Gunicorn                   | 23.0.0        |
| **Containerization**  | Docker + Docker Compose    | —             |
| **Deployment**        | Render.com                 | —             |

---

## ✨ Features

### 🎓 Student Features

- **Academic Risk Prediction** — Submit attendance, study hours, previous marks, assignment score, and internal marks to receive an instant predicted final score with a 4-tier risk classification
- **Explainable AI Results** — Every prediction returns a human-readable narrative, ranked impact analysis, personalized recommendations, and SHAP-based feature importance
- **What-If Simulation** — The system auto-simulates what your score would be if weak areas were improved, showing you the path to a better outcome
- **Personal Dashboard** — Visual summary of your prediction history with stats (total predictions, average score, risk breakdown) and trend charts via Recharts
- **Prediction History** — View all past predictions with date, score, risk level, and confidence value
- **Previous Result Lookup** — Look up your latest prediction by name and email without logging in
- **Profile Management** — Update name, email, course, and semester; upload a profile photo (PNG/JPG/WEBP)
- **CSV Export** — Download your full prediction history as a CSV file
- **Risk Alert Email** — Trigger an email notification about your risk level via the notification API

### 🛡️ Admin Features

- **Admin Dashboard** — Full analytics overview: total students, average predicted score, risk distribution (No Risk / Low / Medium / High), and score trend over time
- **Top High-Risk Students** — Instantly see the 5 most at-risk students with their latest scores
- **AI Insights** — Automatically generated human-readable insights from prediction data (e.g., attendance correlation, study hours trend, low-performer count)
- **Model Metrics** — View live Random Forest and XGBoost evaluation metrics (RMSE, MAE, R²) from stored model metadata
- **All Predictions** — Paginated view of every prediction in the system, with student name, email, score, risk, confidence, date, and uploader
- **Chart Data** — Risk distribution and average score by risk level, ready for Recharts visualization
- **User Management** — List all registered users and delete accounts by ID
- **Bulk CSV Upload** — Upload a CSV of students and run batch predictions; results stored in DB and returned in JSON
- **Export CSV** — Download all prediction data as `edurisk_data.csv`
- **Public Analytics Endpoint** — Rate-limited (60 req/hour per IP) public analytics route for BI dashboards

### 🤖 Machine Learning Features

- **Dual-Model Ensemble** — Random Forest (200 estimators) + XGBoost (300 estimators) trained in parallel; final score is the average of both predictions
- **SHAP Explainability** — Per-prediction SHAP values identify the top features driving each prediction
- **Confidence Score** — Model agreement metric (0–1): `confidence = 1 − |RF − XGB| / 100`
- **4-Tier Risk Classification** — No Risk (≥ 90), Low Risk (75–89), Medium Risk (65–74), High Risk (< 65)
- **Global Feature Importance** — SHAP-based importance stored in `model_meta.json` and returned with every prediction
- **Auto-Train on Startup** — If model artifacts are missing, the system auto-generates a synthetic dataset (`n=3,000`) and trains both models
- **What-If Engine** — Simulates an improved scenario by boosting weak features toward threshold values and re-running both models

### 🔐 Authentication Features

- **Registration** — Name, email, password, role (`student`/`admin`), course, semester, and optional profile image (multipart/form-data supported)
- **OTP Verification** — A 6-digit OTP is sent via Resend API; valid for 5 minutes; login is blocked until verified
- **Login** — Returns a JWT access token (2-hour TTL) plus user metadata
- **JWT-Protected Routes** — All sensitive endpoints require a valid `Authorization: Bearer <token>` header
- **Role-Based Access Control** — Admin routes are protected by the custom `@admin_required()` decorator
- **Profile Endpoint** — Returns the authenticated user's full details from the JWT identity

### 🔒 Security Features

- **Bcrypt Password Hashing** — All passwords are salted and hashed via Flask-Bcrypt before storage
- **Input Sanitization** — All string inputs are sanitized with regex to strip HTML tags and JavaScript keywords (XSS prevention)
- **Range Validation** — All academic input fields are validated against strict numeric ranges (e.g., attendance 0–100, study hours 0–10)
- **JWT Error Handling** — Expired, invalid, and missing tokens all return descriptive 401 JSON responses
- **CORS Configuration** — Configured to allow only the frontend origin (configurable via `FRONTEND_URL`)
- **Email Verification Gate** — Unverified accounts cannot log in
- **Admin Role Guard** — Returns `403 Forbidden` with your role if you attempt to access admin endpoints as a student

### 🚀 Deployment Features

- **Docker Compose** — Single-command full-stack deployment with MySQL 8, Flask backend, and React frontend on the `edurisk_net` bridge network
- **Health Checks** — Docker health checks on all three services (MySQL, backend `/api/health`, frontend)
- **Gunicorn Production Server** — Backend uses `gunicorn` for production-grade WSGI serving
- **Render.com Ready** — Backend and frontend are independently deployable on Render
- **OpenAPI / Swagger UI** — Auto-generated interactive API documentation at `/docs` via APIFlask
- **Structured Logging** — Application-wide logging via the centralized `logger` utility
- **Runtime DB Migrations** — The app automatically adds missing columns on startup via `run_profile_migrations()`

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│  (React 18, React Router v6, Axios, Recharts)        │
│  Auth Context · Theme Context · Protected Routes     │
└────────────────────────┬────────────────────────────┘
                         │  HTTP/REST (JWT Bearer)
                         ▼
┌─────────────────────────────────────────────────────┐
│              Flask REST API (APIFlask)                │
│                                                      │
│  ┌──────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │   Auth   │ │Predict  │ │  Admin  │ │ Student │  │
│  │Blueprint │ │Blueprint│ │Blueprint│ │Blueprint│  │
│  └──────────┘ └────┬────┘ └─────────┘ └─────────┘  │
│                    │                                 │
│  ┌─────────────────▼───────────────────────────┐    │
│  │          ML Inference Layer                 │    │
│  │  RandomForest ──┐                           │    │
│  │                 ├─► Ensemble Score          │    │
│  │  XGBoost    ────┘                           │    │
│  │  SHAP Explainer · Insights Engine           │    │
│  │  What-If Simulator · StandardScaler         │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  Utils: Security · Email (Resend) · Logger · Errors  │
└────────────────────────┬────────────────────────────┘
                         │  mysql-connector-python
                         ▼
┌─────────────────────────────────────────────────────┐
│                   MySQL 8 Database                   │
│  users · students · predictions · academic_records   │
│  student_profiles                                    │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Folder Structure

```
Early_Risk_Detection_System/
├── docker-compose.yml              # Full-stack Docker orchestration
├── .dockerignore
├── .gitignore
│
├── backend/
│   ├── app.py                      # Flask app factory, blueprint registration, JWT config
│   ├── requirements.txt            # Python dependencies
│   ├── Dockerfile                  # Python 3.10-slim-bookworm + Gunicorn
│   ├── .dockerignore               # Backend build context exclusions
│   ├── .env.example                # Environment variable template
│   ├── .python-version             # Python version pin (3.10)
│   │
│   ├── blueprints/                 # API route modules
│   │   ├── auth.py                 # Register, OTP verify, Login, Profile
│   │   ├── predict.py              # Single prediction, Bulk CSV, Explain, Model Info
│   │   ├── history.py              # User history, Previous result lookup
│   │   ├── student.py              # Student predictions, Profile CRUD, Photo upload, CSV export
│   │   ├── admin.py                # Users, Analytics, Insights, Metrics, Charts, Export
│   │   └── notify.py               # Risk alert email endpoint
│   │
│   ├── model/                      # ML pipeline (training + inference scripts)
│   │   ├── train_model.py          # Dual-model training: RF + XGBoost + SHAP
│   │   ├── shap_explainer.py       # Per-instance SHAP explanation utility
│   │   ├── model_meta.json         # Stored model metrics and feature importance (dev copy)
│   │   ├── scaler.pkl              # StandardScaler (dev copy)
│   │   └── student_data.csv        # Auto-generated synthetic training dataset
│   │
│   ├── models/                     # Production model artifacts (loaded at runtime)
│   │   ├── rf_model.pkl            # Trained Random Forest (~43 MB)
│   │   ├── xgb_model.pkl           # Trained XGBoost (~1.2 MB)
│   │   ├── scaler.pkl              # Fitted StandardScaler
│   │   └── model_meta.json         # RF & XGB metrics + feature importance
│   │
│   ├── database/
│   │   └── db_config.py            # DB init, table creation, runtime migrations
│   │
│   ├── auth/
│   │   └── auth_routes.py          # Legacy auth routes
│   │
│   ├── utils/
│   │   ├── security.py             # @admin_required decorator, sanitize_string
│   │   ├── email_service.py        # Resend API email wrapper
│   │   ├── insights_engine.py      # XAI: narrative, impact, recommendations, what-if
│   │   ├── errors.py               # Global Flask error handlers
│   │   └── logger.py               # Centralized logger
│   │
│   ├── docs/                       # APIFlask Marshmallow schema definitions
│   │   ├── auth_schema.py
│   │   ├── predict_schema.py
│   │   ├── student_schema.py
│   │   ├── admin_schema.py
│   │   ├── history_schema.py
│   │   ├── notify_schema.py
│   │   ├── schemas.py
│   │   └── tags.py
│   │
│   ├── data/                       # Training dataset
│   │   └── final_student_data_2000.csv
│   │
│   ├── migrations/                 # DB migration scripts
│   ├── logs/                       # Application log files
│   └── static/uploads/             # Uploaded profile images
│
└── frontend/
    ├── package.json                # React 18, React Router v6, Axios, Recharts
    ├── Dockerfile                  # Multi-stage Node LTS -> nginx:alpine build
    ├── nginx.conf                  # SPA routing + cache headers
    ├── .dockerignore               # Frontend build context exclusions
    ├── .env.example                # Frontend env template
    │
    ├── public/
    │   ├── EduRisk-logo.svg        # App logo
    │   ├── index.html
    │   └── screenshots/            # Application screenshots (10 images)
    │
    └── src/
        ├── App.js                  # Root router: public + protected routes
        ├── index.js                # React entry point
        ├── index.css               # Global styles
        ├── responsive.css          # Responsive / media query overrides
        │
        ├── context/
        │   ├── AuthContext.js      # Global auth state (isLoggedIn, user, token)
        │   └── ThemeContext.js     # Dark / light theme toggle
        │
        ├── api/
        │   └── api.js              # Axios instance with JWT Authorization interceptor
        │
        ├── routes/
        │   └── AppRoute.js         # Alternate route definitions
        │
        ├── utils/
        │   ├── validate.js         # Form field validation helpers
        │   └── validateAuth.js     # Auth-specific validation
        │
        ├── pages/                  # 13 full-page components
        │   ├── HomePage.js         # Landing page
        │   ├── LoginPage.js        # Login form
        │   ├── RegisterPage.js     # Registration form (supports profile image upload)
        │   ├── OtpPage.js          # OTP verification screen
        │   ├── PredictPage.js      # Prediction input form
        │   ├── ResultPage.js       # SHAP chart + full XAI insights
        │   ├── PreviousPage.js     # Public previous result lookup
        │   ├── PredictionHistory.js# Logged-in user prediction history
        │   ├── StudentDashboard.js # Student analytics dashboard (Recharts)
        │   ├── AdminDashboard.js   # Admin analytics dashboard (Recharts)
        │   ├── AdminPanel.js       # Admin user management panel
        │   ├── BulkUploadPage.js   # Bulk CSV upload for batch predictions
        │   └── ProfilePage.js      # User profile view and edit
        │
        └── components/             # 7 reusable UI components
            ├── Navbar.js           # Responsive navigation bar
            ├── Navbar.css          # Navbar-specific styles
            ├── AlertBanner.js      # Alert / notification banner
            ├── Loader.js           # Loading spinner
            ├── RiskBadge.js        # Color-coded risk level badge
            ├── Skeleton.js         # Skeleton loading placeholder
            └── StatCard.js         # Analytics stat card widget
```

---

## 📸 Screenshots

### 🌐 Public Pages

| Home Page                                   | Login                                        | Register                                        |
| ------------------------------------------- | -------------------------------------------- | ----------------------------------------------- |
| ![Home](frontend/public/screenshots/s1.png) | ![Login](frontend/public/screenshots/s2.png) | ![Register](frontend/public/screenshots/s3.png) |

### 🎓 Student Module

| Student Dashboard                                            | Prediction Form                                            | Result & SHAP Insights                                    |
| ------------------------------------------------------------ | ---------------------------------------------------------- | --------------------------------------------------------- |
| ![Dashboard](frontend/public/screenshots/student_panel0.png) | ![Predict](frontend/public/screenshots/student_panel1.png) | ![Result](frontend/public/screenshots/student_panel2.png) |

| Prediction History                                         |
| ---------------------------------------------------------- |
| ![History](frontend/public/screenshots/student_panel4.png) |

### 🛡️ Admin Module

| Admin Dashboard                                            | User Management                                                | Analytics Charts                                               |
| ---------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| ![Admin Dashboard](frontend/public/screenshots/admin0.png) | ![Admin Panel 1](frontend/public/screenshots/admin_panel1.png) | ![Admin Panel 2](frontend/public/screenshots/admin_panel2.png) |

---

## 🛠️ Installation

### Prerequisites

| Tool    | Minimum Version  |
| ------- | ---------------- |
| Python  | 3.10+            |
| Node.js | 18+              |
| npm     | 9+               |
| MySQL   | 8.0+             |
| Docker  | 20+ _(optional)_ |

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/vinod-saini10/Edurisk_Risk_Detection_System.git
cd Edurisk_Risk_Detection_System
```

---

### 2️⃣ Backend Setup

```bash
cd backend

# Create and activate a virtual environment

# macOS / Linux:
source venv310/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

---

### 3️⃣ Environment Variables

**Backend** — Copy the template and fill in your values:

```bash
cp backend/.env.example backend/.env
```

**Frontend** — Copy the template and fill in your value:

```bash
cp frontend/.env.example frontend/.env
```

See [Environment Variables](#-environment-variables) for a full reference of every variable.

---

### 4️⃣ Database Setup

Ensure MySQL 8 is running and accessible. The application **automatically creates** the database and all required tables on first startup.

> **No manual SQL scripts required.** The `initialize_database()` function in `database/db_config.py` handles schema creation and runtime migrations automatically.

---

### 5️⃣ Model Files

Trained model artifacts must be present in `backend/models/`.

**Option A — Use pre-trained models:**

Place `rf_model.pkl`, `xgb_model.pkl`, `scaler.pkl`, and `model_meta.json` in the `backend/models/` directory.

**Option B — Retrain from scratch:**

```bash
cd backend
python model/train_model.py
```

> If model artifacts are missing at startup, the backend will **auto-train** using a generated synthetic dataset (`n=3,000` rows).

---

### 6️⃣ Run the Backend

```bash
cd backend
python app.py
```

| URL                                | Description            |
| ---------------------------------- | ---------------------- |
| `http://localhost:5000`            | API Root               |
| `http://localhost:5000/docs`       | Interactive Swagger UI |
| `http://localhost:5000/api/health` | Health Check           |

---

### 7️⃣ Run the Frontend

```bash
cd frontend
npm install
npm start
```

The React app will be available at **http://localhost:3000**

---

### 🐳 Docker (Full-Stack, Recommended)

```bash
docker compose up --build
```

To run in detached mode:

```bash
docker compose up --build -d

# Stream live logs
docker compose logs -f

# Stop and tear down
docker compose down
```

| Service      | URL                        | Notes                                   |
| ------------ | -------------------------- | --------------------------------------- |
| Frontend     | http://localhost:3000      | Multi-stage React build served by nginx |
| Backend API  | http://localhost:5000      | Flask app factory served by Gunicorn    |
| Swagger Docs | http://localhost:5000/docs | APIFlask OpenAPI UI                     |
| MySQL        | localhost:3306             | Persistent named volume `mysql_data`    |

The Compose stack now includes:

- MySQL healthchecks that wait for the password defined in `backend/.env`
- Backend healthchecks against `/api/health`
- Build-time `REACT_APP_API_URL` injection for the React client
- Named volumes for `mysql_data`, `backend_logs`, and `backend_uploads`
- A shared bridge network so backend and database resolve each other by service name

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable                      | Description                                                  | Example                   |
| ----------------------------- | ------------------------------------------------------------ | ------------------------- |
| `SECRET_KEY`                  | Flask application secret key                                 | `change_this_secret_key`  |
| `JWT_SECRET_KEY`              | JWT signing secret — **change in production**                | `change_this_jwt_secret`  |
| `DB_HOST`                     | MySQL database host                                          | `mysql`                   |
| `DB_PORT`                     | MySQL port                                                   | `3306`                    |
| `DB_USER`                     | MySQL username                                               | `root`                    |
| `DB_PASSWORD`                 | MySQL password — **change in production**                    | `change_this_db_password` |
| `DB_NAME`                     | Database name (auto-created on startup)                      | `edurisk_db`              |
| `MYSQL_ROOT_PASSWORD`         | MySQL root password used by the Compose database container   | `change_this_db_password` |
| `MYSQL_DATABASE`              | Database name used by the MySQL container                    | `edurisk_db`              |
| `RESEND_API_KEY`              | API key from [resend.com](https://resend.com) for OTP emails | ``                        |
| `FRONTEND_URL`                | CORS allowed origin (your React app URL)                     | `http://localhost:3000`   |
| `PUBLIC_ANALYTICS_RATE_LIMIT` | Public analytics request limit per window                    | `60`                      |
| `PUBLIC_ANALYTICS_WINDOW`     | Public analytics rate limit window in seconds                | `3600`                    |
| `FLASK_ENV`                   | Runtime environment                                          | `production`              |

### Frontend (`frontend/.env`)

| Variable            | Description          | Example                     |
| ------------------- | -------------------- | --------------------------- |
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5000/api` |

> **Never commit real secrets.** Always use `.env.example` as the committed template and keep actual `.env` files in `.gitignore`.

---

## 📡 API Reference

> **Base URL:** `http://localhost:5000/api`
>
> **Auth Header:** `Authorization: Bearer <JWT_TOKEN>`
>
> **Interactive Docs:** `http://localhost:5000/docs`

---

### 🔐 Authentication — `/api/auth`

| Method | Endpoint           | Auth   | Description                                    |
| ------ | ------------------ | ------ | ---------------------------------------------- |
| `POST` | `/auth/register`   | Public | Register new user; sends 6-digit OTP via email |
| `POST` | `/auth/verify-otp` | Public | Verify OTP and activate account                |
| `POST` | `/auth/login`      | Public | Login with email + password; returns JWT       |
| `GET`  | `/auth/profile`    | 🔐 JWT | Get authenticated user's profile details       |

**Register Request:**

```json
{
  "name": "Vinod Saini",
  "email": "vinod@example.com",
  "password": "secure123",
  "role": "student",
  "course": "MCA",
  "semester": "4th"
}
```

> Registration also supports `multipart/form-data` with an optional `image` file field for uploading a profile photo at registration time.

**Login Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": 1,
    "name": "Vinod Saini",
    "email": "vinod@example.com",
    "role": "student"
  }
}
```

---

### 🎯 Prediction — `/api/predict`

| Method | Endpoint                | Auth   | Description                                          |
| ------ | ----------------------- | ------ | ---------------------------------------------------- |
| `POST` | `/predict`              | 🔐 JWT | Run single student prediction with full XAI response |
| `POST` | `/predict/bulk`         | 🔐 JWT | Bulk predict from uploaded CSV file                  |
| `GET`  | `/predict/info`         | Public | Get model metadata (features, metrics, importance)   |
| `GET`  | `/predict/explain/<id>` | 🔐 JWT | Get SHAP explanation for a stored prediction by ID   |

**Prediction Request:**

```json
{
  "name": "Rahul Kumar",
  "email": "rahul@example.com",
  "attendance": 72.5,
  "study_hours": 3.5,
  "prev_marks": 68.0,
  "assignment": 75.0,
  "internal": 70.0
}
```

**Prediction Response (condensed):**

```json
{
  "predicted_score": 74.32,
  "risk_level": "Medium Risk",
  "risk_severity": "Moderate",
  "confidence": 0.943,
  "explanation": {
    "narrative": [
      "🟠 Study Hours is below average (3.5h/day) → moderate negative impact"
    ],
    "impact_analysis": [
      { "feature": "study_hours", "badge": "Needs Improvement" }
    ],
    "recommendations": [
      "Study more consistently — aim for 6.0h/day (est. +5.0 score)"
    ],
    "what_if": {
      "improved_score": 82.5,
      "improved_risk": "Low Risk",
      "improvements_applied": ["Study Hours: 3.5h → 6.0h"]
    }
  },
  "feature_importance": {
    "attendance": 7.57,
    "study_hours": 4.98,
    "prev_marks": 6.4,
    "assignment": 4.0,
    "internal": 5.32
  },
  "shap_detail": {
    "top_reasons": ["attendance", "prev_marks", "study_hours"],
    "shap_values": [1.2, 0.8, -0.5, 0.3, 0.1]
  }
}
```

**Bulk CSV Format:**

```csv
name,email,attendance,study_hours,previous_marks,assignment_score,internal_marks
Rahul Kumar,rahul@example.com,72,3.5,68,75,70
Priya Sharma,priya@example.com,85,6,80,90,85
```

---

### 📜 History — `/api/history`

| Method | Endpoint            | Auth   | Description                                                   |
| ------ | ------------------- | ------ | ------------------------------------------------------------- |
| `GET`  | `/history`          | 🔐 JWT | Get all predictions made by the authenticated user (last 100) |
| `POST` | `/history/previous` | Public | Look up the latest prediction by student name + email         |

---

### 👤 Student — `/api/student`

| Method         | Endpoint                      | Auth   | Description                               |
| -------------- | ----------------------------- | ------ | ----------------------------------------- |
| `GET`          | `/student/predictions`        | 🔐 JWT | Get own predictions with summary stats    |
| `GET`          | `/student/predictions/export` | 🔐 JWT | Download prediction history as a CSV file |
| `GET`          | `/student/profile`            | 🔐 JWT | Get student profile details               |
| `POST` / `PUT` | `/student/profile`            | 🔐 JWT | Create or update student profile          |
| `POST`         | `/student/profile/photo`      | 🔐 JWT | Upload profile image (PNG / JPG / WEBP)   |

---

### 🛡️ Admin — `/api/admin`

| Method   | Endpoint               | Auth     | Description                                    |
| -------- | ---------------------- | -------- | ---------------------------------------------- |
| `GET`    | `/admin/users`         | 🔐 Admin | List all registered users                      |
| `DELETE` | `/admin/user/<id>`     | 🔐 Admin | Delete a user by ID                            |
| `GET`    | `/admin/analytics`     | 🔐 Admin | Full analytics dashboard data                  |
| `GET`    | `/admin/insights`      | 🔐 Admin | AI-generated insights from prediction data     |
| `GET`    | `/admin/model-metrics` | 🔐 Admin | RF and XGBoost evaluation metrics              |
| `GET`    | `/admin/predictions`   | 🔐 Admin | All predictions with student and uploader info |
| `GET`    | `/admin/charts`        | 🔐 Admin | Risk distribution + avg score by risk level    |
| `GET`    | `/admin/export`        | 🔐 Admin | Download all prediction data as CSV            |

---

### 🔔 Notification — `/api/notify`

| Method | Endpoint        | Auth   | Description                          |
| ------ | --------------- | ------ | ------------------------------------ |
| `POST` | `/notify/email` | Public | Send a risk alert email to a student |

---

### ⚙️ System

| Method | Endpoint         | Auth         | Description                             |
| ------ | ---------------- | ------------ | --------------------------------------- |
| `GET`  | `/api/health`    | Public       | Health check — model status, env status |
| `GET`  | `/api/analytics` | Rate-limited | Public analytics (60 req/hour per IP)   |
| `GET`  | `/`              | Public       | API root with docs link                 |
| `GET`  | `/docs`          | Public       | Interactive Swagger / OpenAPI UI        |

---

## 🤖 Machine Learning Pipeline

### Dataset Summary

| Property               | Value                                                       |
| ---------------------- | ----------------------------------------------------------- |
| **Primary Source**     | `backend/data/final_student_data_2000.csv`                  |
| **Fallback**           | Auto-generated synthetic dataset (`n=3,000` rows via NumPy) |
| **Dataset Size**       | 2,000 rows (primary) / 3,000 rows (synthetic fallback)      |
| **Number of Features** | 5 input features                                            |
| **Target Variable**    | `predicted_score` (continuous, 0–100)                       |

### Input Features

| Feature       | Range      | Description                    |
| ------------- | ---------- | ------------------------------ |
| `attendance`  | 0–100 %    | Lecture attendance percentage  |
| `study_hours` | 0–10 h/day | Daily self-study hours         |
| `prev_marks`  | 0–100      | Previous semester / exam marks |
| `assignment`  | 0–100      | Assignment submission score    |
| `internal`    | 0–100      | Internal exam / mid-term marks |

### Score Formula (Synthetic Data Generation)

```
predicted_score = clip(
    0.30 x attendance
  + 2.00 x study_hours
  + 0.30 x prev_marks
  + 0.20 x assignment
  + 0.20 x internal
  + noise(mean=0, sigma=5),
  0, 100
)
```

> The `study_hours` coefficient is deliberately large (2.0) so that low-effort students cluster in High Risk and high-effort students reach No Risk.

### Preprocessing Pipeline

1. Load `final_student_data_2000.csv` or auto-generate a synthetic dataset
2. Normalize column aliases (`previous_marks` to `prev_marks`, `assignment_score` to `assignment`, `internal_marks` to `internal`)
3. Fill `NaN` values with column medians
4. `train_test_split` — 80 % train / 20 % test (`random_state=42`)
5. `StandardScaler` — fit on the training split, applied to both splits

### Models

**Random Forest**

```python
RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
```

**XGBoost**

```python
XGBRegressor(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    eval_metric="rmse"
)
```

### Ensemble Logic

```
final_score = clip( (RF_prediction + XGB_prediction) / 2, 0, 100 )
```

### Confidence Score Formula

```
confidence = max(0.0,  1.0 - abs(RF_prediction - XGB_prediction) / 100)
```

A value of `1.0` means both models are in perfect agreement; a value near `0.0` indicates high disagreement.

### Model Metrics (Production — from `models/model_meta.json`)

| Model             | RMSE | MAE  | R2        |
| ----------------- | ---- | ---- | --------- |
| **Random Forest** | 5.97 | 4.80 | **0.867** |
| **XGBoost**       | 5.48 | 4.43 | **0.888** |

### SHAP Feature Importance (Global Average — from `models/model_meta.json`)

| Feature       | Mean   | SHAP | Value |
| ------------- | ------ | ---- | ----- |
| `attendance`  | 7.5725 |
| `prev_marks`  | 6.3982 |
| `internal`    | 5.3215 |
| `study_hours` | 4.9807 |
| `assignment`  | 4.0020 |

### Risk Classification

| Tier            | Score Range | Severity | Meaning               |
| --------------- | ----------- | -------- | --------------------- |
| **No Risk**     | >= 90       | Safe     | Academically strong   |
| **Low Risk**    | 75 – 89     | Stable   | On track              |
| **Medium Risk** | 65 – 74     | Moderate | Needs monitoring      |
| **High Risk**   | < 65        | Critical | Intervention required |

### Prediction Flow

```
User Input (5 features)
        |
  StandardScaler.transform()
        |
    +-----------------------+
    |  RF.predict()         |--+
    +-----------------------+  +---> Ensemble Score ---> classify_risk()
    +-----------------------+  |                |
    |  XGB.predict()        |--+                v
    +-----------------------+   Confidence = 1 - |RF - XGB| / 100
                                               |
                              SHAP Explainer (top 5 features)
                                               |
                               Insights Engine (XAI layer)
                           +------------------------------+
                           | - Narrative (bullet points)  |
                           | - Ranked impact analysis     |
                           | - Personalized recos         |
                           | - What-if simulation         |
                           +------------------------------+
                                               |
                                        Persist to DB
                                               |
                                       Return to Client
```

### SHAP Explainability

`model/shap_explainer.py` uses the `shap` library on the XGBoost model to compute per-instance SHAP values. Returns:

- **`top_reasons`** — Top N feature names ranked by absolute SHAP value
- **`shap_values`** — Raw SHAP values for all 5 features (drives the feature importance bar chart on the Result page)

---

## 🔐 Authentication Flow

```
1. POST /api/auth/register
   |-- Validate input (name, email, password, role)
   |-- Hash password with bcrypt
   |-- Generate 6-digit OTP (5-min expiry)
   |-- Insert user row (is_verified = 0)
   +-- Send OTP email via Resend API

         |

2. POST /api/auth/verify-otp  { email, otp }
   |-- Match OTP and check expiry
   +-- Set is_verified = 1, clear OTP fields

         |

3. POST /api/auth/login  { email, password }
   |-- Verify bcrypt hash
   |-- Check is_verified == 1
   +-- Return JWT (2h TTL) + user metadata

         |

4. Client stores JWT in AuthContext / localStorage

         |

5. All protected API calls:
   Authorization: Bearer <access_token>

         |

6. @jwt_required() validates token signature + expiry
   @admin_required() additionally checks role == "admin"
```

---

## 🗄️ Database Design

### `users`

| Column          | Type                    | Notes                       |
| --------------- | ----------------------- | --------------------------- |
| `id`            | INT PK AUTO_INCREMENT   | —                           |
| `name`          | VARCHAR(150)            | —                           |
| `email`         | VARCHAR(255) UNIQUE     | —                           |
| `password_hash` | VARCHAR(255)            | bcrypt hash                 |
| `role`          | ENUM('student','admin') | Default: 'student'          |
| `otp`           | VARCHAR(10)             | Cleared after verification  |
| `otp_expiry`    | DATETIME                | 5 minutes from registration |
| `is_verified`   | TINYINT                 | 0 = unverified, 1 = active  |
| `created_at`    | DATETIME                | DEFAULT CURRENT_TIMESTAMP   |

### `students`

| Column  | Type                  | Notes |
| ------- | --------------------- | ----- |
| `id`    | INT PK AUTO_INCREMENT | —     |
| `name`  | VARCHAR(150)          | —     |
| `email` | VARCHAR(255)          | —     |

### `predictions`

| Column             | Type                  | Notes                         |
| ------------------ | --------------------- | ----------------------------- |
| `id`               | INT PK AUTO_INCREMENT | —                             |
| `student_id`       | INT                   | FK -> students                |
| `user_id`          | INT                   | FK -> users (uploader)        |
| `attendance`       | FLOAT                 | Input feature                 |
| `study_hours`      | FLOAT                 | Input feature                 |
| `previous_marks`   | FLOAT                 | Input feature                 |
| `assignment_score` | FLOAT                 | Input feature                 |
| `internal_marks`   | FLOAT                 | Input feature                 |
| `predicted_score`  | FLOAT                 | Ensemble output               |
| `risk_level`       | VARCHAR(20)           | No / Low / Medium / High Risk |
| `confidence`       | FLOAT                 | Model agreement (0–1)         |
| `created_at`       | DATETIME              | DEFAULT CURRENT_TIMESTAMP     |

### `academic_records`

| Column             | Type                  | Notes                           |
| ------------------ | --------------------- | ------------------------------- |
| `id`               | INT PK AUTO_INCREMENT | —                               |
| `student_id`       | INT                   | FK -> students (CASCADE DELETE) |
| `attendance`       | FLOAT                 | —                               |
| `study_hours`      | FLOAT                 | —                               |
| `previous_marks`   | FLOAT                 | —                               |
| `assignment_score` | FLOAT                 | —                               |
| `internal_marks`   | FLOAT                 | —                               |

### `student_profiles`

| Column       | Type                  | Notes                          |
| ------------ | --------------------- | ------------------------------ |
| `id`         | INT PK AUTO_INCREMENT | —                              |
| `user_id`    | INT UNIQUE            | FK -> users                    |
| `name`       | VARCHAR(150)          | —                              |
| `email`      | VARCHAR(255)          | —                              |
| `course`     | VARCHAR(150)          | e.g., MCA, B.Tech              |
| `semester`   | VARCHAR(50)           | e.g., 4th                      |
| `image_url`  | VARCHAR(512)          | Absolute URL to uploaded image |
| `updated_at` | DATETIME              | Auto-updates on every change   |

---

## 🚀 Deployment

### Option 1: Docker Compose (All-in-One, Recommended)

```bash
# Build and start all services
docker-compose up --build -d

# View live logs
docker-compose logs -f

# Stop and remove containers
docker-compose down
```

The Compose file defines three services on the `edurisk_net` bridge network:

| Service    | Image            | Port       | Notes                                                                   |
| ---------- | ---------------- | ---------- | ----------------------------------------------------------------------- |
| `mysql`    | mysql:8          | 3306       | Persistent volume `mysql_data`; health check via `mysqladmin ping`      |
| `backend`  | python:3.10-slim | 5000       | Waits for MySQL healthy; mounts `./backend/data` and `./backend/models` |
| `frontend` | node             | 3000 -> 80 | Depends on backend; health check via `wget --spider`                    |

---

### Option 2: Render.com

#### Backend Web Service

| Setting            | Value                                              |
| ------------------ | -------------------------------------------------- |
| **Runtime**        | Python 3                                           |
| **Root Directory** | `backend/`                                         |
| **Build Command**  | `pip install -r requirements.txt`                  |
| **Start Command**  | `gunicorn "app:create_app()" --bind 0.0.0.0:$PORT` |

**Environment Variables on Render:**

```env
SECRET_KEY=<strong-random-secret>
JWT_SECRET_KEY=<strong-random-secret>
DB_HOST=<your-mysql-host>
DB_PORT=3306
DB_USER=<db-user>
DB_PASSWORD=<db-password>
DB_NAME=edurisk_db
RESEND_API_KEY=<resend-key>
FRONTEND_URL=https://your-frontend.onrender.com
FLASK_ENV=production
```

#### Frontend Static Site

| Setting               | Value                          |
| --------------------- | ------------------------------ |
| **Root Directory**    | `frontend/`                    |
| **Build Command**     | `npm install && npm run build` |
| **Publish Directory** | `build`                        |

**Environment Variables:**

```env
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

---

### Warning: Production Checklist

- Change all default secrets (`JWT_SECRET_KEY`, `DB_PASSWORD`, `SECRET_KEY`) before going live
- Model files are large (~43 MB for RF). Mount them as a Render persistent disk or bake into the Docker image
- The `onboarding@resend.dev` sender only works for verified test addresses. Add your own verified domain for production
- For cloud MySQL, use PlanetScale, Aiven, or Railway and set `DB_HOST` accordingly
- HTTPS is enabled automatically on Render's managed infrastructure
- Set `FRONTEND_URL` in your backend env to prevent CORS errors from your deployed frontend

---

## ⭐ Key Achievements

✔ **Random Forest R2 = 0.867** — Strong regression accuracy on a 5-feature academic dataset

✔ **XGBoost R2 = 0.888** — Highest R2 in the ensemble, driving the final averaged score

✔ **RMSE ~5.48 – 5.97** — Sub-6-point average error on a 0–100 score scale

✔ **SHAP Explainability** — Every prediction returns per-feature SHAP values and a ranked impact narrative

✔ **JWT Authentication** — Stateless, role-bearing tokens with bcrypt-hashed passwords and OTP email gate

✔ **Bulk Prediction** — Admin CSV upload processes an entire student cohort in a single API call

✔ **Admin Analytics** — System-wide risk distribution, score trends, and AI-generated insights

✔ **Prediction History** — Persistent per-student prediction log with CSV export

✔ **Full-Stack Docker** — Three-service `docker-compose.yml` with health checks and persistent volumes

✔ **OpenAPI Documentation** — Auto-generated Swagger UI via APIFlask with Bearer auth scheme

---

## 🔮 Future Improvements

- [ ] **Real Dataset Integration** — Train on anonymized real student data with institutional approval
- [ ] **Admin OTP Approval** — Require admin confirmation for accounts registering with the `admin` role
- [ ] **HTML Email Templates** — Styled HTML email templates for OTP and risk alerts
- [ ] **JWT Refresh Token** — Implement a refresh token flow to extend sessions without re-login
- [ ] **Rate Limiting** — Apply `flask-limiter` across auth and prediction endpoints
- [ ] **PDF Report Export** — Generate a downloadable PDF for each prediction result
- [ ] **Weekly Email Digest** — Automated weekly email reports for at-risk students
- [ ] **Model Retraining Pipeline** — Admin-triggered retraining with uploaded CSV datasets
- [ ] **Redis Caching** — Cache analytics queries to reduce database load
- [ ] **Multi-Language Support** — Frontend internationalization (i18n)
- [ ] **Mobile App** — React Native companion app for on-the-go predictions
- [ ] **Advanced Analytics** — Cohort analysis, semester-wise trends, department comparisons

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository on GitHub
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit your changes** with a clear message
   ```bash
   git commit -m "feat: add your feature description"
   ```
4. **Push** to your fork
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request** — describe what your PR does and link any relevant issues

Please ensure your code follows the existing style, includes appropriate comments, and does not break existing functionality.

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024 Vinod Saini

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

---

## 👨‍💻 Author

<div align="center">

### Vinod Saini

**MCA Student · Full-Stack Developer · ML Enthusiast**

_Final Year MCA Project — PCU (Pimpri Chinchwad University), Maharashtra_

</div>

---

## 📬 Contact

| Platform    | Link                                               |
| ----------- | -------------------------------------------------- |
| 🐙 GitHub   | https://github.com/vinod-saini10                   |
| 💼 LinkedIn | https://www.linkedin.com/in/vinod-saini-37b71a25b/ |
| 📧 Email    | vinod.saini24@pcu.edu.in                           |

---

<div align="center">

**Built with love using Python, Flask, React, and Machine Learning**

_EduRisk — Because every student deserves a second chance, before it's too late._

**Star this repo if you found it helpful!**

</div>

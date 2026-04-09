# EduRisk – Student Academic Risk Prediction System
**MCA Major Project | Pimpri Chinchwad University | 2025-26**

---

## 📁 Project Structure

```
edurisk/
├── backend/
│   ├── app.py                   ← Flask REST API (all routes)
│   ├── requirements.txt
│   ├── database/
│   │   └── db_config.py         ← Auto DB + table creation
│   └── model/
│       ├── train_model.py        ← Dataset generation + ML training
│       ├── model.pkl             ← Generated on first run
│       ├── scaler.pkl            ← Generated on first run
│       └── student_data.csv     ← Generated on first run
└── frontend/
    ├── package.json
    └── src/
        ├── App.js               ← React Router setup
        ├── index.js
        ├── index.css
        ├── api/api.js           ← Axios API layer
        ├── components/          ← Navbar, RiskBadge, StatCard, Loader
        └── pages/               ← 6 screens
```

---

## ⚙️ Prerequisites

- Python 3.9+
- Node.js 18+
- MySQL 8.0+ (running locally)
- pip, npm

---

## 🗄️ Database Setup

**No manual SQL needed.** The Flask app auto-creates:
- Database: `edurisk_db`
- Tables: `students`, `academic_records`, `predictions`

Just ensure MySQL is running and edit the password in:
```
backend/database/db_config.py  →  "password": "your_mysql_password"
```

---

## 🚀 Run Backend

```bash
cd edurisk/backend

# 1. Install dependencies
pip install -r requirements.txt

# 2. Start Flask (auto-trains model + creates DB on first run)
python app.py
```

API runs at: **http://localhost:5000**

---

## 🖥️ Run Frontend

```bash
cd edurisk/frontend

# 1. Install dependencies
npm install

# 2. Start React dev server
npm start
```

App opens at: **http://localhost:3000**

---

## 📡 API Endpoints

| Method | Endpoint        | Description                        |
|--------|----------------|------------------------------------|
| POST   | /api/predict   | Predict score + risk, store in DB  |
| POST   | /api/previous  | Fetch result by name + email       |
| GET    | /api/students  | All student records (admin)        |
| GET    | /api/charts    | Chart data (risk dist, avg scores) |
| GET    | /api/health    | Health check                       |

---

## 🤖 ML Details

| Item             | Value                             |
|------------------|-----------------------------------|
| Dataset          | 2500 synthetic records            |
| Features         | attendance, study_hours, previous_marks, assignment_score, internal_marks |
| Target           | final_score (weighted formula)    |
| Models           | Linear Regression, Random Forest  |
| Selection        | Lowest RMSE wins                  |
| Metrics          | RMSE, MAE, R²                     |
| Preprocessing    | Missing value imputation, StandardScaler |

### Risk Classification
| Score     | Risk Level   |
|-----------|-------------|
| ≥ 75      | 🟢 Low Risk  |
| 50 – 74   | 🟡 Medium Risk |
| < 50      | 🔴 High Risk |

---

## 📺 6 Screens

1. **Home** – Navigation hub with project overview
2. **Predict** – Form with 7 academic fields + validation
3. **Result** – Score gauge, risk badge, academic breakdown
4. **Previous Result** – Lookup stored result by name + email
5. **Student Dashboard** – Bar chart + Radar chart for individual student
6. **Admin Dashboard** – Full table with filters, sort, pie chart + bar chart

---

## 🗃️ Database Schema

```sql
students          (id, name, email, created_at)
academic_records  (id, student_id FK, attendance, study_hours,
                   previous_marks, assignment_score, internal_marks)
predictions       (id, student_id FK, predicted_score, risk_level, created_at)
```
All tables use InnoDB with FK constraints and proper indexes.

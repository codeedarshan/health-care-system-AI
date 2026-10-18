# AuraHealth AI — 100% Python Edition

Complete Python implementation of the AuraHealth AI clinical triage, vitals tracking, disease prediction, and hospital geolocation platform.

---

## 📁 Files Included

1. **`main.py`** — Production-grade **FastAPI** REST API backend with:
   - Gemini 3.5 AI clinical chat integration + offline fallback
   - Emergency symptom triage engine with priority flags
   - Biometrics calculation (BMI, Blood Pressure, Fasting Glucose)
   - Chronic disease risk prediction algorithms (CVD, Type-2 Diabetes, Hypertension)
   - Gujarat hospital geolocation directory with GPS Haversine distance calculator
   - Role-Based Access Control (RBAC) & Security Audit Logging
   - Automatic Swagger documentation at `http://localhost:8000/docs`

2. **`streamlit_app.py`** — Complete **Pure Python Interactive Web UI** (Streamlit):
   - Interactive Dashboard
   - Live AI Consultation Chatbot
   - Interactive Emergency Triage Form
   - Vitals & Biometrics Logger with automated alert badges
   - Disease Risk Predictor with sliders & visual progress meters
   - Gujarat Hospital Radar with city filters
   - Administrator Control Center (Login: `darshan` / `darshan@194`)
   - High-contrast visual styling (Black, Blue, White, Red, Orange)

3. **`requirements.txt`** — All Python package dependencies.

---

## 🚀 How to Run on Localhost

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 2. Option A: Run Full Interactive Python Web App (Streamlit)
```bash
streamlit run streamlit_app.py
```
👉 Opens directly in your browser at: `http://localhost:8501`

### 3. Option B: Run FastAPI REST API Backend
```bash
python main.py
```
*or:*
```bash
uvicorn main:app --reload --port 8000
```
👉 Interactive API Docs & Test Console: `http://localhost:8000/docs`

---

## 🔑 Login Credentials

- **Administrator:**
  - Username: `darshan`
  - Password: `darshan@194`
- **Patient / Member:**
  - Register new account or sign in with any patient credentials.

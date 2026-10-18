# Software Requirements Specification (SRS)
## Project Title: AuraHealth AI - Health Companion & Triage System

**Document Version:** 1.0.0  
**Date:** August 8, 2026  
**Author / Lead:** AI Studio Development Team  
**System Target:** Web Application (Responsive Desktop & Mobile)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document details the functional, non-functional, interface, and structural requirements for **AuraHealth AI**. This specification serves as the formal software development and operational baseline for engineers, system administrators, and clinical stakeholders.

### 1.2 Scope
**AuraHealth AI** is a web-based medical information, triage, and personal wellness management system. The platform integrates artificial intelligence (Gemini 3.5 AI model) to assist patients with symptom checking, disease risk prediction, health vitals monitoring, medication scheduling, and GPS-assisted emergency hospital location across major cities in Gujarat, India. Additionally, it provides a secured Administrator Control Center for managing platform users, medical centers, and audit logs.

### 1.3 Definitions, Acronyms, and Abbreviations
- **SRS:** Software Requirements Specification
- **RBAC:** Role-Based Access Control
- **AI:** Artificial Intelligence
- **BMI:** Body Mass Index
- **BP:** Blood Pressure (Systolic / Diastolic)
- **UI/UX:** User Interface / User Experience
- **ER:** Emergency Room / Emergency Services

---

## 2. Overall Description

### 2.1 Product Perspective
AuraHealth AI operates as a full-stack web applet powered by a Node.js Express server backend and a React Single Page Application (SPA) frontend. It utilizes Gemini 3.5 AI for natural language clinical guidance and triage logic, while maintaining client-side state synchronization through browser storage mechanisms.

### 2.2 User Classes and Characteristics

1. **Patient / Member User:**
   - **Characteristics:** Individuals seeking health guidance, vitals tracking, symptom assessment, and hospital location services.
   - **Access Level:** Standard Patient Portal (Dashboard, AI Assistant, Symptom Checker, Vitals Tracker, Medication Schedule, Risk Predictor, Hospital Radar).

2. **System Administrator:**
   - **Characteristics:** Platform managers responsible for overseeing patient databases, managing hospital directories, and inspecting safety audit logs.
   - **Access Level:** Restricted Administrative Control Center (`/admin`).
   - **Credentials:** Username: `darshan` | Password: `darshan@194`

### 2.3 Operating Environment
- **Browser Compatibility:** Chrome, Edge, Safari, Firefox (Latest 2 major versions).
- **Runtime Environment:** Node.js v18+ containerized on Cloud Run.
- **Port Ingress:** Port 3000 (Reverse Proxy bound).
- **Responsive Layout:** Desktop (1280px+), Tablet (768px-1024px), Mobile (360px-480px).

---

## 3. Specific Functional Requirements

### 3.1 Authentication & Role Management
- **REQ-AUTH-1:** The system shall present a unified login and registration interface without direct test bypass shortcuts.
- **REQ-AUTH-2:** The system shall authenticate standard Patients via username/email and password credentials.
- **REQ-AUTH-3:** The system shall route users with Administrator credentials (`darshan` / `darshan@194`) directly to the Administrator Control Center.
- **REQ-AUTH-4:** The system shall support persistent session management with instant logout capability.

### 3.2 Patient Dashboard (`DashboardView.tsx`)
- **REQ-DASH-1:** The system shall display patient profile summary, vitals trends (BP, Glucose, BMI), and active medication alerts.
- **REQ-DASH-2:** The system shall provide one-click quick action buttons to navigate to core wellness modules.

### 3.3 AI Health Assistant (`ChatView.tsx`)
- **REQ-CHAT-1:** The system shall enable real-time natural language health consultations using Gemini 3.5 AI.
- **REQ-CHAT-2:** The system shall present a prominent safety warning disclaiming official medical diagnosis.
- **REQ-CHAT-3:** The system shall provide quick suggestion chips for common wellness inquiries.

### 3.4 AI Symptom Checker & Emergency Triage (`SymptomView.tsx`)
- **REQ-SYMP-1:** The system shall capture user symptoms, duration, age category, and severity level.
- **REQ-SYMP-2:** The system shall evaluate input data and categorize urgency into Low, Medium, or Emergency High severity.
- **REQ-SYMP-3:** The system shall present actionable immediate emergency directives and home care suggestions.

### 3.5 Vitals & Health Logger (`VitalsView.tsx`)
- **REQ-VIT-1:** The system shall allow users to log Systolic/Diastolic BP, Fasting Blood Glucose, Heart Rate, Weight, Height, and Sleep Hours.
- **REQ-VIT-2:** The system shall calculate BMI dynamically and assign a health status indicator (Underweight, Healthy, Overweight, Obese).
- **REQ-VIT-3:** The system shall trigger visual warning alerts when vitals exceed safe physiological ranges.

### 3.6 Medication Scheduler (`MedicationView.tsx`)
- **REQ-MED-1:** The system shall allow users to add medications with dosage, frequency, and timed reminder slots.
- **REQ-MED-2:** The system shall track daily adherence via completion checkboxes.

### 3.7 Smart Disease Risk Predictor (`SmartPredictorView.tsx`)
- **REQ-RISK-1:** The system shall assess statistical risk for Cardiovascular Disease, Type-2 Diabetes, and Hypertension based on clinical risk factors.
- **REQ-RISK-2:** The system shall render visual progress meters and lifestyle prevention advice.

### 3.8 Hospital Geolocation Radar (`HospitalView.tsx`)
- **REQ-HOSP-1:** The system shall list emergency hospitals and medical centers across Gujarat (Ahmedabad, Surat, Vadodara, Rajkot, etc.).
- **REQ-HOSP-2:** The system shall support filtering by city, 24/7 ER availability, distance, and rating.
- **REQ-HOSP-3:** The system shall provide direct emergency call shortcuts (`tel:`) and mapping directions.

### 3.9 Administrator Control Center (`AdminView.tsx`)
- **REQ-ADM-1:** The administrator dashboard shall display live system metrics (registered patient count, hospital listings count, query logs).
- **REQ-ADM-2:** The administrator shall have authorization to create new patient accounts, edit user roles, and delete patient records.
- **REQ-ADM-3:** The administrator shall have authority to register and modify hospital listings.
- **REQ-ADM-4:** The system shall maintain an immutable administrative security audit trail for user logins, registrations, and hospital updates.

---

## 4. User Interface & Aesthetic Requirements

### 4.1 Enforced Color Palette
In strict adherence to design requirements, the system UI is constrained exclusively to the following 5 colors:

1. **Black (`#000000` / `slate-900`):** Primary headings, top navigation header, dark mode containers, dark typography.
2. **Blue (`#2563EB` / `blue-600`):** Primary branding, interactive buttons, tabs, low-risk indicators, system confirmation banners.
3. **White (`#FFFFFF` / `slate-50`):** App canvas background, card content panels, white text on dark surfaces.
4. **Red (`#DC2626` / `red-600`):** Critical emergency alerts, high BP/glucose warnings, deletion actions, high-risk triage.
5. **Orange (`#EA580C` / `orange-600`):** Medium-risk warnings, symptom cautions, star ratings, system alerts.

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
- **Page Load Time:** Initial render within < 1.5 seconds on standard 4G networks.
- **AI Response Latency:** Gemini AI response streaming starts within < 1.2 seconds.
- **Local State Sync:** UI state updates reflect instantly (< 50ms).

### 5.2 Security Requirements
- **Role Isolation:** Non-admin users attempting to access administrative views are blocked and redirected to login.
- **Input Sanitization:** Form inputs are sanitized against XSS injection.
- **Credential Protection:** Admin credentials verified securely on login attempt.

### 5.3 Reliability & Availability
- **System Uptime:** Target 99.9% uptime.
- **Offline Fault Tolerance:** Core vitals, medication schedule, and hospital directory remain functional offline via cached browser state.

---

## 6. System Design & Data Architecture

### 6.1 Storage Keys (Browser Persistence)
- `healthfem_user_session`: Active logged-in user profile object.
- `healthfem_users_list`: Array of registered patient and administrator accounts.
- `healthfem_admin_logs`: Array of audit log entries.
- `healthfem_custom_hospitals`: Array of admin-managed hospital entries.
- `healthfem_patient_vitals`: Array of recorded health measurements.
- `healthfem_patient_meds`: Array of tracked medication items.

---

## 7. Approval & Sign-Off

| Stakeholder Role | Name / Title | Status | Date |
|---|---|---|---|
| Lead Developer | AI Coding Assistant | Approved | August 8, 2026 |
| System Administrator | Darshan Jain | Approved | August 8, 2026 |

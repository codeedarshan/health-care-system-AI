# AuraHealth AI - Project Documentation

## 1. Overview
**AuraHealth AI** is an intelligent health companion and clinical triage platform designed to empower patients with personalized wellness insights, symptom triage, health vitals monitoring, medication tracking, disease prediction, and real-time hospital geolocation routing (focused on medical centers across Gujarat, India).

---

## 2. Authentication & System Roles

The application enforces role-based access control (RBAC) with dual user roles:

### 🔑 Administrator Access
- **Username / Identifier:** `darshan`
- **Password:** `darshan@194`
- **Role Permissions:**
  - Access to the **Administrator Control Center** (`/admin`).
  - View live operational metrics (Registered Patients, System Status, Active AI Queries).
  - Manage registered patient profiles and toggle administrator roles.
  - Register, update, and manage hospital centers across Gujarat (Ahmedabad, Surat, Vadodara, Rajkot, Bhavnagar, Jamnagar, Gandhinagar, Anand).
  - Review real-time security logs and system audit trails.

### 👤 Patient / Member Access
- **Standard Login / Register:** Patients log in with their registered email/username and password or create a new account via the registration form.
- **Role Permissions:**
  - Full access to the Patient Portal (Dashboard, AI Health Assistant, Symptom Checker, Vitals Logger, Medication Schedule, AI Predictor, and Nearby Hospitals).
  - Personal health data remains private and scoped to the patient session.

---

## 3. Strict UI Color Palette Guidelines

In compliance with design directives, the UI strictly utilizes the following color palette across all light and dark themes:

| Color | CSS Usage & Utility Classes | Primary Application |
|---|---|---|
| **Black / Dark Neutral** | `bg-slate-900`, `text-slate-900`, `bg-black`, `text-slate-800` | Headers, text headings, primary surfaces |
| **White / Light Neutral** | `bg-white`, `text-white`, `bg-slate-50` | Primary backgrounds, card containers, white text |
| **Blue** | `bg-blue-600`, `text-blue-500`, `border-blue-200` | Primary actions, branding, success indicators, low-risk statuses |
| **Red** | `bg-red-600`, `text-[#DC2626]`, `border-red-200` | High-severity alerts, emergency protocols, medical warnings |
| **Orange** | `bg-orange-500`, `text-orange-600`, `border-orange-200` | Moderate-severity alerts, ratings, highlights, cautions |

---

## 4. Core Features & Functional Modules

1. **AI Health Assistant (`ChatView.tsx`)**
   - Natural language clinical consultation powered by Gemini 3.5 AI.
   - Tailored advice incorporating modern clinical practices and traditional Ayurvedic wellness care.

2. **AI Symptom Checker (`SymptomView.tsx`)**
   - Interactive triage form evaluating symptoms, duration, age group, and severity.
   - Calculates risk levels (Low, Medium, High) with immediate emergency protocols and home-care directives.

3. **Vitals & Health Logger (`VitalsView.tsx`)**
   - Real-time logging of blood pressure, blood glucose, heart rate, weight, height, and sleep duration.
   - Automatic BMI calculation and health status classifications.

4. **Medication Tracker (`MedicationView.tsx`)**
   - Timed pill schedules with dosage, frequency, and interactive completion tracking.

5. **Smart Disease Risk Predictor (`SmartPredictorView.tsx`)**
   - AI-driven predictive risk assessment for Cardiovascular Disease, Type-2 Diabetes, and Hypertension based on clinical risk markers.

6. **Hospital Geolocation Radar (`HospitalView.tsx`)**
   - GPS-enabled locator finding nearest emergency medical centers and hospitals across Gujarat.
   - Filter by city (Ahmedabad, Surat, Vadodara, etc.), rating, distance, and 24/7 ER availability.

7. **System Admin Panel (`AdminView.tsx`)**
   - Centralized system administrative dashboard for managing accounts, hospital listings, and security audit logs.

---

## 5. Technology Stack & Architecture

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling Engine:** Tailwind CSS
- **Icons:** Lucide React (`lucide-react`)
- **Backend Service:** Express.js (`server.ts`)
- **AI Integration:** Gemini API (@google/genai SDK)
- **Local Persistence:** LocalStorage (`healthfem_users_list`, `healthfem_admin_logs`, `healthfem_custom_hospitals`)

---

## 6. How to Run & Deploy

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build

# Start production server
npm run start
```

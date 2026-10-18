"""
AuraHealth AI - Complete Python Backend (FastAPI)
Author: Darshan Jain
Description: Full-stack healthcare AI platform with symptom triage, vitals tracking,
             disease risk prediction, and hospital geolocation routing.
"""

import os
import math
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

# ==========================================
# GEMINI AI INITIALIZATION (PYTHON SDK)
# ==========================================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
ai_client = None

try:
    if GEMINI_API_KEY:
        from google import genai
        ai_client = genai.Client(api_key=GEMINI_API_KEY)
except Exception as e:
    print(f"[Warning] Google GenAI client initialization skipped: {e}")

app = FastAPI(
    title="AuraHealth AI API",
    description="Python Clinical Health Companion & Triage System",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# IN-MEMORY DATABASE & PRE-LOADED DATA
# ==========================================

USERS_DB = [
    {
        "id": "u-admin",
        "username": "darshan",
        "email": "darshanjain1957@gmail.com",
        "password": "darshan@194",
        "role": "admin",
        "name": "Darshan Jain (System Admin)",
        "created_at": datetime.now().isoformat()
    },
    {
        "id": "u-patient1",
        "username": "rahul",
        "email": "rahul.patel@example.com",
        "password": "patient@123",
        "role": "patient",
        "name": "Rahul Patel",
        "created_at": datetime.now().isoformat()
    }
]

HOSPITALS_DB = [
    {
        "id": "h-1",
        "name": "Civil Hospital & Asarwa Trauma Center",
        "city": "Ahmedabad",
        "state": "Gujarat",
        "address": "Asarwa, Ahmedabad, Gujarat 380016",
        "phone": "+91 79 2268 3721",
        "rating": 4.6,
        "er_24_7": True,
        "latitude": 23.0525,
        "longitude": 72.6028,
        "specialties": ["Trauma", "Cardiology", "Burn Unit", "Pediatrics"]
    },
    {
        "id": "h-2",
        "name": "Apollo Hospitals International",
        "city": "Ahmedabad",
        "state": "Gujarat",
        "address": "Plot No 1A, GIDC Bhat, Gandhinagar - Ahmedabad 382428",
        "phone": "+91 79 6670 1800",
        "rating": 4.8,
        "er_24_7": True,
        "latitude": 23.1118,
        "longitude": 72.6372,
        "specialties": ["Cardiac Surgery", "Oncology", "Neurology", "Emergency"]
    },
    {
        "id": "h-3",
        "name": "New Civil Hospital",
        "city": "Surat",
        "state": "Gujarat",
        "address": "Majura Gate, Ring Road, Surat, Gujarat 395001",
        "phone": "+91 261 224 4456",
        "rating": 4.4,
        "er_24_7": True,
        "latitude": 21.1702,
        "longitude": 72.8311,
        "specialties": ["Emergency Medicine", "General Surgery", "Orthopedics"]
    },
    {
        "id": "h-4",
        "name": "SSG Hospital (Sir Sayajirao General)",
        "city": "Vadodara",
        "state": "Gujarat",
        "address": "Jail Road, Anandpura, Vadodara, Gujarat 390001",
        "phone": "+91 265 242 4848",
        "rating": 4.5,
        "er_24_7": True,
        "latitude": 22.3106,
        "longitude": 73.1926,
        "specialties": ["Trauma & Critical Care", "ICU", "Dialysis"]
    },
    {
        "id": "h-5",
        "name": "PDU Civil Hospital",
        "city": "Rajkot",
        "state": "Gujarat",
        "address": "Jamnagar Road, Rajkot, Gujarat 360001",
        "phone": "+91 281 245 4220",
        "rating": 4.3,
        "er_24_7": True,
        "latitude": 22.3039,
        "longitude": 70.8022,
        "specialties": ["Emergency", "General Medicine", "Pediatrics"]
    }
]

AUDIT_LOGS = [
    {
        "id": "log-1",
        "type": "login",
        "user": "darshan",
        "details": "Administrator logged in to AuraHealth Control Center",
        "timestamp": datetime.now().isoformat()
    }
]

# ==========================================
# PYDANTIC DATA SCHEMAS
# ==========================================

class LoginRequest(BaseModel):
    username_or_email: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    name: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []

class SymptomTriageRequest(BaseModel):
    symptoms: str
    duration: str
    age_group: str
    severity: str  # "mild", "moderate", "severe"

class VitalsLogRequest(BaseModel):
    systolic_bp: float = Field(..., ge=60, le=250)
    diastolic_bp: float = Field(..., ge=40, le=160)
    fasting_glucose: float = Field(..., ge=40, le=500)
    heart_rate: float = Field(..., ge=35, le=220)
    weight_kg: float = Field(..., ge=20, le=300)
    height_cm: float = Field(..., ge=50, le=250)
    sleep_hours: float = Field(..., ge=1, le=24)

class RiskPredictorRequest(BaseModel):
    age: int
    systolic_bp: float
    cholesterol_mg_dl: float
    fasting_glucose: float
    bmi: float
    smoker: bool
    family_history_cardiac: bool
    physical_activity_hours_per_week: float

class HospitalCreateRequest(BaseModel):
    name: str
    city: str
    address: str
    phone: str
    rating: float
    er_24_7: bool
    latitude: float
    longitude: float
    specialties: List[str]

# ==========================================
# CORE ALGORITHMS & LOGIC (PURE PYTHON)
# ==========================================

def calculate_bmi(weight_kg: float, height_cm: float) -> Dict[str, Any]:
    height_m = height_cm / 100.0
    bmi = round(weight_kg / (height_m ** 2), 2)
    if bmi < 18.5:
        category = "Underweight"
        color = "orange"
    elif bmi < 25.0:
        category = "Healthy weight"
        color = "blue"
    elif bmi < 30.0:
        category = "Overweight"
        color = "orange"
    else:
        category = "Obese"
        color = "red"
    return {"bmi": bmi, "category": category, "color": color}

def classify_blood_pressure(systolic: float, diastolic: float) -> Dict[str, str]:
    if systolic >= 140 or diastolic >= 90:
        return {"status": "Hypertension Stage 2", "severity": "danger", "color": "red"}
    elif systolic >= 130 or diastolic >= 80:
        return {"status": "Hypertension Stage 1", "severity": "warning", "color": "orange"}
    elif systolic >= 120 and diastolic < 80:
        return {"status": "Elevated", "severity": "warning", "color": "orange"}
    elif systolic < 90 or diastolic < 60:
        return {"status": "Hypotension (Low BP)", "severity": "warning", "color": "orange"}
    else:
        return {"status": "Normal / Optimal", "severity": "optimal", "color": "blue"}

def classify_blood_glucose(fasting_mg_dl: float) -> Dict[str, str]:
    if fasting_mg_dl >= 126:
        return {"status": "Diabetes Indicator (High)", "severity": "danger", "color": "red"}
    elif fasting_mg_dl >= 100:
        return {"status": "Pre-diabetes Indicator", "severity": "warning", "color": "orange"}
    elif fasting_mg_dl < 70:
        return {"status": "Hypoglycemia (Low Sugar)", "severity": "danger", "color": "red"}
    else:
        return {"status": "Normal Fasting", "severity": "optimal", "color": "blue"}

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

# ==========================================
# REST API ENDPOINTS
# ==========================================

@app.get("/")
def home():
    """Returns application status and interactive guide."""
    return {
        "app": "AuraHealth AI - Python Edition",
        "status": "Online & Operational",
        "version": "1.0.0",
        "documentation": "/docs",
        "endpoints": [
            "/api/auth/login",
            "/api/chat",
            "/api/triage",
            "/api/vitals",
            "/api/predict",
            "/api/hospitals",
            "/api/admin/users",
            "/api/admin/logs"
        ]
    }

# ----------------- AUTHENTICATION -----------------
@app.post("/api/auth/login")
def login(req: LoginRequest):
    user = next((u for u in USERS_DB if (u["username"] == req.username_or_email or u["email"] == req.username_or_email)), None)
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid username or password.")
    
    AUDIT_LOGS.insert(0, {
        "id": f"log-{len(AUDIT_LOGS)+1}",
        "type": "login",
        "user": user["username"],
        "details": f"User logged in ({user['role']})",
        "timestamp": datetime.now().isoformat()
    })

    return {
        "success": True,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }

@app.post("/api/auth/register")
def register(req: RegisterRequest):
    if any(u["username"] == req.username for u in USERS_DB):
        raise HTTPException(status_code=400, detail="Username already taken.")
    if any(u["email"] == req.email for u in USERS_DB):
        raise HTTPException(status_code=400, detail="Email already registered.")

    new_user = {
        "id": f"u-{len(USERS_DB)+1}",
        "username": req.username,
        "email": req.email,
        "password": req.password,
        "name": req.name,
        "role": "patient",
        "created_at": datetime.now().isoformat()
    }
    USERS_DB.append(new_user)

    AUDIT_LOGS.insert(0, {
        "id": f"log-{len(AUDIT_LOGS)+1}",
        "type": "signup",
        "user": req.username,
        "details": "New patient registration",
        "timestamp": datetime.now().isoformat()
    })

    return {"success": True, "message": "Account created successfully.", "user": new_user}

# ----------------- AI CHAT & CONSULTATION -----------------
@app.post("/api/chat")
def clinical_chat(req: ChatRequest):
    msg_lower = req.message.lower()
    
    # If Gemini SDK client is configured, call it
    if ai_client:
        try:
            prompt = (
                "You are AuraHealth AI, a supportive clinical health companion. "
                "Provide clear, empathetic, and evidence-based wellness guidance. "
                "Always remind the patient to seek in-person emergency medical care if symptoms are acute or dangerous.\n\n"
                f"Patient Query: {req.message}"
            )
            response = ai_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            return {"response": response.text, "source": "Gemini AI"}
        except Exception as e:
            print(f"[Error calling Gemini]: {e}")

    # High-Fidelity Python Fallback Knowledge Base
    if "fever" in msg_lower or "bukhar" in msg_lower or "temperature" in msg_lower:
        reply = (
            "🌡️ **Fever Guidance:**\n"
            "- Monitor body temperature every 4 hours.\n"
            "- Hydrate with warm water, electrolyte solutions, or herbal soups.\n"
            "- Rest in a cool, well-ventilated room.\n"
            "- **Emergency Alert:** If temperature exceeds 103°F (39.4°C) or is accompanied by stiff neck, rash, or confusion, consult a physician immediately."
        )
    elif "headache" in msg_lower or "sir dard" in msg_lower:
        reply = (
            "💆 **Headache Care:**\n"
            "- Drink a tall glass of water; dehydration is a frequent culprit.\n"
            "- Rest in a quiet, dimly lit space for 20-30 minutes.\n"
            "- Apply a cold or warm compress to forehead or temples.\n"
            "- **Emergency Warning:** Seek urgent care if this is a sudden 'worst headache of your life' (thunderclap)."
        )
    elif "bp" in msg_lower or "pressure" in msg_lower or "hypertension" in msg_lower:
        reply = (
            "❤️ **Blood Pressure Advice:**\n"
            "- Keep sodium intake below 2,000 mg/day (DASH diet principles).\n"
            "- Practice slow deep diaphragmatic breathing for 5 minutes.\n"
            "- Avoid caffeine, tobacco, and alcohol before measurements."
        )
    else:
        reply = (
            f"Thank you for sharing your inquiry: '{req.message}'.\n\n"
            "Key recommendations:\n"
            "1. Maintain regular hydration and balanced nutrition.\n"
            "2. Track your daily vital parameters (BP, heart rate, blood sugar).\n"
            "3. If your symptoms are persistent or causing significant discomfort, please schedule a direct consultation with a qualified medical professional."
        )

    return {"response": reply, "source": "AuraHealth Clinical Rules Engine (Python)"}

# ----------------- SYMPTOM TRIAGE -----------------
@app.post("/api/triage")
def symptom_triage(req: SymptomTriageRequest):
    symptoms_text = req.symptoms.lower()
    
    # Critical Red Flags
    emergency_keywords = ["chest pain", "shortness of breath", "unconscious", "stroke", "paralysis", "bleeding profusely", "heart attack"]
    is_emergency = any(kw in symptoms_text for kw in emergency_keywords) or req.severity == "severe"

    if is_emergency:
        risk_level = "High Emergency"
        color = "red"
        directive = "Seek immediate in-person emergency care or call 108/112."
        actions = [
            "Call local emergency services immediately",
            "Sit in a relaxed, upright position",
            "Do not consume heavy foods or stimulants",
            "Keep emergency contact numbers handy"
        ]
    elif req.severity == "moderate" or "fever" in symptoms_text or "vomiting" in symptoms_text:
        risk_level = "Moderate"
        color = "orange"
        directive = "Monitor closely; schedule a clinic appointment within 24 hours if symptoms persist."
        actions = [
            "Maintain strict hydration",
            "Log vitals every 4 hours",
            "Rest and minimize physical exertion"
        ]
    else:
        risk_level = "Low"
        color = "blue"
        directive = "Mild condition; manageable with supportive home care and observation."
        actions = [
            "Rest and proper hydration",
            "Wholesome home-cooked meals",
            "Re-assess if symptoms worsen"
        ]

    return {
        "risk_level": risk_level,
        "color": color,
        "directive": directive,
        "recommended_actions": actions,
        "timestamp": datetime.now().isoformat()
    }

# ----------------- VITALS LOGGING -----------------
@app.post("/api/vitals")
def log_vitals(v: VitalsLogRequest):
    bmi_info = calculate_bmi(v.weight_kg, v.height_cm)
    bp_info = classify_blood_pressure(v.systolic_bp, v.diastolic_bp)
    glucose_info = classify_blood_glucose(v.fasting_glucose)

    alerts = []
    if bp_info["severity"] == "danger":
        alerts.append({"type": "bp", "message": f"Critical BP Alert: {v.systolic_bp}/{v.diastolic_bp} mmHg", "color": "red"})
    if glucose_info["severity"] == "danger":
        alerts.append({"type": "glucose", "message": f"Critical Glucose Alert: {v.fasting_glucose} mg/dL", "color": "red"})

    return {
        "bmi": bmi_info,
        "blood_pressure": bp_info,
        "blood_glucose": glucose_info,
        "alerts": alerts,
        "all_vitals_normal": len(alerts) == 0
    }

# ----------------- PREDICTIVE DISEASE RISK ENGINE -----------------
@app.post("/api/predict")
def predict_disease_risk(data: RiskPredictorRequest):
    # 1. Cardiovascular Risk Score (Framingham-inspired heuristic)
    cvd_score = 5
    if data.age > 45: cvd_score += 15
    if data.systolic_bp >= 140: cvd_score += 20
    elif data.systolic_bp >= 130: cvd_score += 10
    if data.cholesterol_mg_dl > 200: cvd_score += 15
    if data.smoker: cvd_score += 20
    if data.family_history_cardiac: cvd_score += 15
    if data.bmi >= 30: cvd_score += 10
    if data.physical_activity_hours_per_week < 2.5: cvd_score += 10
    cvd_prob = min(max(cvd_score, 5), 95)

    # 2. Type-2 Diabetes Risk Score
    t2d_score = 5
    if data.bmi >= 30: t2d_score += 30
    elif data.bmi >= 25: t2d_score += 15
    if data.fasting_glucose >= 126: t2d_score += 40
    elif data.fasting_glucose >= 100: t2d_score += 20
    if data.age > 40: t2d_score += 15
    t2d_prob = min(max(t2d_score, 5), 95)

    # 3. Hypertension Risk Score
    htn_score = 10
    if data.systolic_bp >= 130: htn_score += 45
    if data.bmi >= 28: htn_score += 20
    if data.age > 50: htn_score += 15
    htn_prob = min(max(htn_score, 10), 95)

    return {
        "cardiovascular_risk_percent": cvd_prob,
        "cardiovascular_tier": "High" if cvd_prob >= 50 else ("Moderate" if cvd_prob >= 25 else "Low"),
        "diabetes_risk_percent": t2d_prob,
        "diabetes_tier": "High" if t2d_prob >= 50 else ("Moderate" if t2d_prob >= 25 else "Low"),
        "hypertension_risk_percent": htn_prob,
        "hypertension_tier": "High" if htn_prob >= 50 else ("Moderate" if htn_prob >= 30 else "Low"),
        "lifestyle_recommendations": [
            "Aim for 150+ minutes of moderate aerobic activity weekly",
            "Incorporate a Mediterranean/DASH heart-healthy diet",
            "Monitor blood pressure and fasting glucose at consistent weekly intervals"
        ]
    }

# ----------------- HOSPITALS & GEOLOCATION -----------------
@app.get("/api/hospitals")
def get_hospitals(city: Optional[str] = None, user_lat: Optional[float] = None, user_lon: Optional[float] = None):
    results = HOSPITALS_DB.copy()
    if city and city.lower() != "all":
        results = [h for h in results if h["city"].lower() == city.lower()]
    
    if user_lat is not None and user_lon is not None:
        for h in results:
            h["distance_km"] = haversine_distance(user_lat, user_lon, h["latitude"], h["longitude"])
        results.sort(key=lambda x: x.get("distance_km", 9999))
    
    return {"count": len(results), "hospitals": results}

@app.post("/api/admin/hospitals")
def create_hospital(h: HospitalCreateRequest):
    new_hosp = {
        "id": f"h-{len(HOSPITALS_DB)+1}",
        **h.model_dump()
    }
    HOSPITALS_DB.append(new_hosp)
    AUDIT_LOGS.insert(0, {
        "id": f"log-{len(AUDIT_LOGS)+1}",
        "type": "hospital_update",
        "user": "admin",
        "details": f"Added medical center: {h.name} in {h.city}",
        "timestamp": datetime.now().isoformat()
    })
    return {"success": True, "hospital": new_hosp}

# ----------------- ADMIN CONTROLS -----------------
@app.get("/api/admin/users")
def get_admin_users():
    return [{"id": u["id"], "username": u["username"], "name": u["name"], "email": u["email"], "role": u["role"]} for u in USERS_DB]

@app.get("/api/admin/logs")
def get_admin_logs():
    return AUDIT_LOGS

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*50)
    print("🚀 Starting AuraHealth AI (Python FastAPI Server)")
    print("📍 Local URL: http://localhost:8000")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("="*50 + "\n")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface VitalRecord {
  id: string;
  timestamp: string;
  weight?: number; // kg
  height?: number; // cm
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  bloodSugar?: number; // mg/dL
  heartRate?: number; // bpm
  temperature?: number; // °C or °F
}

export interface WaterLog {
  amount: number; // in ml
  timestamp: string;
}

export interface MealLog {
  id: string;
  name: string;
  calories: number;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  timestamp: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: string; // e.g. "08:00 AM"
  takenToday: boolean;
  takenLogs: string[]; // array of ISO strings when taken
}

export interface HealthProfile {
  name: string;
  age: number | null;
  gender: string;
  height: number | null; // cm
  weight: number | null; // kg
  bloodType: string;
  medicalConditions: string[];
  allergies: string[];
  healthGoals: "weight-loss" | "weight-gain" | "maintain" | "fitness" | "";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "";
  dietaryPreference: "none" | "vegetarian" | "vegan" | "keto" | "gluten-free" | "";
}

export interface HealthMetrics {
  waterIntake?: number; // current ml
  waterTarget?: number; // target ml
  steps: number; // current
  stepsTarget: number; // target
  sleepHours: number; // current
  sleepTarget: number; // target
  mood: "excellent" | "good" | "neutral" | "tired" | "stressed" | "";
}

export interface SymptomCheckResult {
  severity: "low" | "medium" | "high";
  possibleCauses: string[];
  homeRemedies: string[];
  advice: string;
  requiresDoctor: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  rating: number;
  distance: number; // in km
  specialties: string[];
  hasEmergency: boolean;
  latitude: number;
  longitude: number;
  openStatus: string; // e.g. "Open 24 Hours", "Open 9 AM - 9 PM"
}

export interface HospitalFinderResponse {
  hospitals: Hospital[];
  aiAdvice?: string; // AI recommendations for which departments/specialties to consult
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: "user" | "admin";
  createdAt: string;
  age?: number;
  gender?: string;
}

export interface AdminLog {
  id: string;
  timestamp: string;
  type: "login" | "signup" | "symptom_triage" | "hospital_update" | "vitals_change" | "user_delete" | "user_update";
  user: string;
  details: string;
}

export interface SmartForecastWeek {
  week: number;
  restingHeartRate: number;
  stressIndex: number;
  energyLevel: number;
}

export interface SmartPredictorResult {
  wellnessScore: number;
  doshaVata: number;
  doshaPitta: number;
  doshaKapha: number;
  forecastWeeks: SmartForecastWeek[];
  insights: string[];
  ayurvedicAnalysis: string;
  projectedBenefits: string;
}



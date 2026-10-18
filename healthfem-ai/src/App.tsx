import React, { useState, useEffect } from "react";
import { 
  Heart, Activity, Bot, Clock, Stethoscope, 
  Sparkles, User, HelpCircle, Menu, X, MapPin, Sun, Moon,
  LogOut, ShieldAlert, ShieldCheck, Shield
} from "lucide-react";
import { ChatMessage, VitalRecord, Medication, HealthMetrics, HealthProfile, UserAccount } from "./types";

import DashboardView from "./components/DashboardView";
import ChatView from "./components/ChatView";
import VitalsView from "./components/VitalsView";
import SymptomView from "./components/SymptomView";
import MedicationView from "./components/MedicationView";
import HospitalView from "./components/HospitalView";
import AuthView from "./components/AuthView";
import AdminView from "./components/AdminView";
import SmartPredictorView from "./components/SmartPredictorView";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Auth Session State ---
  const [user, setUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem("healthfem_user_session");
    return saved ? JSON.parse(saved) : null;
  });

  // --- Initial Default States ---
  const defaultProfile: HealthProfile = {
    name: "",
    age: null,
    gender: "",
    height: null,
    weight: null,
    bloodType: "",
    medicalConditions: [],
    allergies: [],
    healthGoals: "",
    activityLevel: "",
    dietaryPreference: ""
  };

  const defaultVitals: VitalRecord[] = [];

  const defaultMeds: Medication[] = [];

  const defaultMetrics: HealthMetrics = {
    steps: 0,
    stepsTarget: 10000,
    sleepHours: 0,
    sleepTarget: 8,
    mood: ""
  };

  const defaultMessages: ChatMessage[] = [
    {
      id: "msg-default-1",
      sender: "ai",
      text: "Namaste! I am AuraHealth AI, your personal AI wellness and health companion. How can I assist you with your fitness goals, health advice, or home care remedies today?",
      timestamp: "08:00 AM"
    }
  ];

  // --- State Hooks ---
  const [profile, setProfile] = useState<HealthProfile>(() => {
    const saved = localStorage.getItem("health_sathi_profile");
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const [vitals, setVitals] = useState<VitalRecord[]>(() => {
    const saved = localStorage.getItem("health_sathi_vitals");
    return saved ? JSON.parse(saved) : defaultVitals;
  });

  const [meds, setMeds] = useState<Medication[]>(() => {
    const saved = localStorage.getItem("health_sathi_meds");
    return saved ? JSON.parse(saved) : defaultMeds;
  });

  const [metrics, setMetrics] = useState<HealthMetrics>(() => {
    const saved = localStorage.getItem("health_sathi_metrics");
    return saved ? JSON.parse(saved) : defaultMetrics;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("health_sathi_chat");
    return saved ? JSON.parse(saved) : defaultMessages;
  });

  const [chatLoading, setChatLoading] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("health_sathi_theme");
    return (saved as "light" | "dark") === "dark" ? "dark" : "light";
  });

  // Theme select utility
  const selectTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("health_sathi_theme", newTheme);
  };

  // --- Effects to sync with LocalStorage ---
  useEffect(() => {
    localStorage.setItem("health_sathi_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("health_sathi_vitals", JSON.stringify(vitals));
  }, [vitals]);

  useEffect(() => {
    localStorage.setItem("health_sathi_meds", JSON.stringify(meds));
  }, [meds]);

  useEffect(() => {
    localStorage.setItem("health_sathi_metrics", JSON.stringify(metrics));
  }, [metrics]);

  useEffect(() => {
    localStorage.setItem("health_sathi_chat", JSON.stringify(chatMessages));
  }, [chatMessages]);

  // --- Core Action Handlers ---

  // Chat
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: updatedMessages.slice(-10) // Send last 10 messages for context
        }),
      });

      const data = await response.json();
      if (response.ok && data.text) {
        const aiMsg: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          sender: "ai",
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setChatMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || "Failed to generate response");
      }
    } catch (error: any) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: "ai",
        text: `Sorry, I encountered an issue contacting the AuraHealth server: ${error.message || "Unknown error"}. Please recheck your API key setup in Secrets.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // Vitals
  const handleAddVital = (record: Omit<VitalRecord, "id" | "timestamp">) => {
    const newRecord: VitalRecord = {
      ...record,
      id: `v-${Date.now()}`,
      timestamp: new Date().toLocaleDateString("en-US", { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
    setVitals(prev => [newRecord, ...prev]);
  };

  const handleDeleteVital = (id: string) => {
    setVitals(prev => prev.filter(v => v.id !== id));
  };

  // Steps
  const handleIncrementSteps = (amount: number) => {
    setMetrics(prev => ({
      ...prev,
      steps: prev.steps + amount
    }));
  };

  // Sleep
  const handleUpdateSleepHours = (hours: number) => {
    setMetrics(prev => ({
      ...prev,
      sleepHours: hours
    }));
  };

  // Medications
  const handleAddMed = (med: Omit<Medication, "id" | "takenToday" | "takenLogs">) => {
    const newMed: Medication = {
      ...med,
      id: `med-${Date.now()}`,
      takenToday: false,
      takenLogs: []
    };
    setMeds(prev => [...prev, newMed]);
  };

  const handleToggleMed = (id: string) => {
    setMeds(prev => prev.map(m => {
      if (m.id === id) {
        const isTaken = !m.takenToday;
        return {
          ...m,
          takenToday: isTaken,
          takenLogs: isTaken ? [...m.takenLogs, new Date().toISOString()] : m.takenLogs
        };
      }
      return m;
    }));
  };

  const handleDeleteMed = (id: string) => {
    setMeds(prev => prev.filter(m => m.id !== id));
  };

  const handleResetMedsDaily = () => {
    setMeds(prev => prev.map(m => ({ ...m, takenToday: false })));
  };

  const handleLoginSuccess = (loggedInUser: UserAccount) => {
    setUser(loggedInUser);
    localStorage.setItem("healthfem_user_session", JSON.stringify(loggedInUser));
    
    // Also, align profile details with logged in user if available
    if (loggedInUser.name) {
      setProfile(prev => ({
        ...prev,
        name: loggedInUser.name,
        age: loggedInUser.age || prev.age,
        gender: loggedInUser.gender || prev.gender
      }));
    }
    setActiveTab(loggedInUser.role === "admin" ? "admin" : "dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("healthfem_user_session");
    setActiveTab("dashboard");
  };

  // Quick navigation toggling helper
  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const baseNavigationItems = [
    { id: "dashboard", label: "Dashboard", icon: <Activity size={16} /> },
    { id: "predictor", label: "Smart Predictor", icon: <Sparkles size={16} className="text-blue-500 animate-pulse" /> },
    { id: "chat", label: "AI Sathi Coach", icon: <Bot size={16} /> },
    { id: "vitals", label: "Vitals Logger", icon: <Heart size={16} /> },
    { id: "symptoms", label: "Symptom Assessor", icon: <Stethoscope size={16} /> },
    { id: "medications", label: "Pill Scheduler", icon: <Clock size={16} /> },
    { id: "hospitals", label: "Near Hospitals", icon: <MapPin size={16} className="text-blue-500 animate-pulse" /> },
  ];

  const navigationItems = user?.role === "admin"
    ? [...baseNavigationItems, { id: "admin", label: "Admin Panel", icon: <Shield size={16} className="text-blue-500 animate-pulse" /> }]
    : baseNavigationItems;

  if (!user) {
    return (
      <div className="bg-[#FAFAFA] text-[#000000] min-h-screen flex flex-col font-sans" id="app-root">
        <header className="sticky top-0 z-40 h-16 flex items-center justify-between border-b border-[#122A4E] bg-[#0A192F] text-white" id="app-header">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#DC2626] text-white font-bold shadow-xs">
                <Heart size={16} className="fill-white" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight font-sans text-white">
                  Aura<span className="text-[#DC2626] underline decoration-2 underline-offset-4">Health AI</span>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 bg-[#122A4E] p-1 rounded-xl border border-[#1E3F66] shadow-xs" id="theme-palette">
              <span className="text-xs px-2.5 py-1 text-white font-medium">Secure AI Gateway</span>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center bg-[#FAFAFA]">
          <AuthView onLoginSuccess={handleLoginSuccess} theme={theme} />
        </main>

        <footer className="bg-[#0A192F] text-[#6B7280] border-t border-[#122A4E] py-6 text-center text-xs mt-auto" id="app-footer">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="font-medium text-[#6B7280]">
              AuraHealth AI Companion — Designed for a healthier, energetic, and mindful tomorrow.
            </p>
            <div className="flex items-center space-x-1 font-semibold text-white">
              <Heart size={12} className="text-[#DC2626] fill-[#DC2626] animate-pulse" />
              <span>Ayurvedic & Wellness Guidance System</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] text-[#000000] min-h-screen flex flex-col font-sans" id="app-root">
      {/* Premium Web Header bar */}
      <header className="sticky top-0 z-40 h-16 flex items-center justify-between border-b border-[#122A4E] bg-[#0A192F] text-white" id="app-header">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => navigateToTab("dashboard")}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#DC2626] text-white font-bold shadow-xs">
              <Heart size={16} className="fill-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight font-sans text-white">
                Aura<span className="text-[#DC2626] underline decoration-2 underline-offset-4">Health AI</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1.5" id="desktop-nav">
              {navigationItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateToTab(item.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                      isActive 
                        ? "bg-[#DC2626] text-white font-bold border border-[#DC2626]"
                        : "text-[#6B7280] hover:text-white hover:bg-[#122A4E]"
                    }`}
                    id={`nav-btn-${item.id}`}
                  >
                    <span className={`${isActive ? "text-white" : "text-[#6B7280]"}`}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Premium Theme Palette Selector */}
            <div className="flex items-center space-x-1.5 bg-[#122A4E] p-1 rounded-xl border border-[#1E3F66] shadow-xs" id="theme-palette">
              <button
                onClick={() => selectTheme("light")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${theme === "light" ? "bg-white text-[#0A192F] shadow-xs" : "text-slate-400 hover:text-white"}`}
                title="Light Theme"
                id="theme-select-light"
              >
                <Sun size={10} />
                <span>Light</span>
              </button>
              <button
                onClick={() => selectTheme("dark")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${theme === "dark" ? "bg-[#DC2626] text-white shadow-xs" : "text-slate-400 hover:text-white"}`}
                title="Dark Theme"
                id="theme-select-dark"
              >
                <Moon size={10} />
                <span>Dark</span>
              </button>
            </div>

            {/* User Profile Info & Logout */}
            <div className="flex items-center space-x-2 border-l border-[#122A4E] pl-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-white flex items-center justify-end space-x-1">
                  {user.role === "admin" && <Shield size={11} className="text-blue-500 fill-blue-500/10 animate-pulse" />}
                  <span>{user.name}</span>
                </span>
                <span className="text-[9px] font-extrabold uppercase text-[#6B7280] tracking-wider">
                  {user.role === "admin" ? "System Admin" : "Active Member"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-red-950/20 transition-all cursor-pointer flex items-center justify-center"
                title="Sign Out"
                id="header-logout-btn"
              >
                <LogOut size={16} />
              </button>
            </div>

            {/* Mobile Menu Icon */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white focus:outline-hidden"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer drop menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A192F] border-b border-[#122A4E] px-4 py-3 space-y-1 z-30 shadow-md" id="mobile-nav">
          {navigationItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateToTab(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                  isActive 
                    ? "bg-[#DC2626] text-white font-bold"
                    : "text-[#6B7280] hover:bg-[#122A4E] hover:text-white"
                }`}
                id={`mobile-nav-btn-${item.id}`}
              >
                <span className={`${isActive ? "text-white" : "text-[#6B7280]"}`}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Body Stage container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" id="main-content-stage">
        {activeTab === "dashboard" && (
          <DashboardView
            vitals={vitals}
            meds={meds}
            metrics={metrics}
            profile={profile}
            theme={theme}
            onNavigate={navigateToTab}
            onIncrementSteps={handleIncrementSteps}
            onToggleMed={handleToggleMed}
          />
        )}
        {activeTab === "predictor" && (
          <SmartPredictorView
            profile={profile}
            metrics={metrics}
            theme={theme}
          />
        )}
        {activeTab === "chat" && (
          <ChatView
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            loading={chatLoading}
          />
        )}
        {activeTab === "vitals" && (
          <VitalsView
            vitals={vitals}
            onAddVital={handleAddVital}
            onDeleteVital={handleDeleteVital}
          />
        )}
        {activeTab === "symptoms" && (
          <SymptomView />
        )}
        {activeTab === "medications" && (
          <MedicationView
            meds={meds}
            onAddMed={handleAddMed}
            onToggleMed={handleToggleMed}
            onDeleteMed={handleDeleteMed}
            onResetMedsDaily={handleResetMedsDaily}
          />
        )}
        {activeTab === "hospitals" && (
          <HospitalView />
        )}
        {activeTab === "admin" && user?.role === "admin" && (
          <AdminView currentUser={user} theme={theme} />
        )}
      </main>

      {/* Clean Premium Footer */}
      <footer className="bg-[#0A192F] text-[#6B7280] border-t border-[#122A4E] py-6 text-center text-xs mt-auto" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="font-medium text-[#6B7280]">
            AuraHealth AI Companion — Designed for a healthier, energetic, and mindful tomorrow.
          </p>
          <div className="flex items-center space-x-1 font-semibold text-white">
            <Heart size={12} className="text-[#DC2626] fill-[#DC2626] animate-pulse" />
            <span>Ayurvedic & Wellness Guidance System</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

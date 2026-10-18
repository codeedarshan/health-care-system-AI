import React, { useState, useEffect } from "react";
import { 
  Activity, Heart, Flame, Clock, CheckCircle2, 
  AlertCircle, ChevronRight, User, Award, ShieldAlert, Sparkles, RefreshCw
} from "lucide-react";
import { VitalRecord, Medication, HealthMetrics, HealthProfile, MealLog } from "../types";

interface DashboardViewProps {
  vitals: VitalRecord[];
  meds: Medication[];
  metrics: HealthMetrics;
  profile: HealthProfile;
  meals?: MealLog[];
  theme: "light" | "dark";
  onNavigate: (tab: string) => void;
  onIncrementWater?: (amount: number) => void;
  onIncrementSteps: (amount: number) => void;
  onToggleMed: (id: string) => void;
}

export default function DashboardView({
  vitals,
  meds,
  metrics,
  profile,
  theme,
  onNavigate,
  onIncrementSteps,
  onToggleMed
}: DashboardViewProps) {
  const [healthTip, setHealthTip] = useState<string>("Take small steps every day towards wellness and health maintenance.");
  const [loadingTip, setLoadingTip] = useState(false);

  const latestVital = vitals[0] || null;

  // Fetch a personalized tip from the backend AI based on the user's current health status
  const fetchAiTip = async () => {
    setLoadingTip(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Please generate a single, highly actionable, encouraging daily health tip or quick nutrition hack (maximum 2 sentences) for a user with the following profile:
Age: ${profile.age}, Gender: ${profile.gender}, Goal: ${profile.healthGoals}, Dietary Preference: ${profile.dietaryPreference}.
Latest blood pressure: ${latestVital?.bloodPressureSystolic || "unknown"}/${latestVital?.bloodPressureDiastolic || "unknown"}, latest heart rate: ${latestVital?.heartRate || "unknown"}.
Add a touch of warm Indian health wisdom or Ayurvedic advice if relevant, keeping it friendly and professional.`,
          history: []
        }),
      });
      const data = await response.json();
      if (data.text) {
        setHealthTip(data.text);
      }
    } catch (error) {
      console.error("Failed to fetch AI tip:", error);
    } finally {
      setLoadingTip(false);
    }
  };

  useEffect(() => {
    fetchAiTip();
  }, [profile]);

  // Assess Blood Pressure status
  const getBpStatus = (sys?: number, dia?: number) => {
    if (!sys || !dia) return { label: "No data", color: "text-slate-500 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" };
    if (sys < 120 && dia < 80) return { label: "Normal", color: "text-blue-700 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 dark:text-blue-400 font-bold" };
    if (sys >= 120 && sys <= 129 && dia < 80) return { label: "Elevated", color: "text-orange-700 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 dark:text-orange-400 font-bold" };
    return { label: "High BP", color: "text-red-700 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 dark:text-red-400 font-bold" };
  };

  // Assess Blood Sugar status
  const getSugarStatus = (sugar?: number) => {
    if (!sugar) return { label: "No data", color: "text-slate-500 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" };
    if (sugar < 100) return { label: "Normal (Fasting)", color: "text-blue-700 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 dark:text-blue-400 font-bold" };
    if (sugar >= 100 && sugar <= 125) return { label: "Prediabetic", color: "text-orange-700 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 dark:text-orange-400 font-bold" };
    return { label: "High (Diabetic)", color: "text-red-700 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 dark:text-red-400 font-bold" };
  };

  const bpStatus = getBpStatus(latestVital?.bloodPressureSystolic, latestVital?.bloodPressureDiastolic);
  const sugarStatus = getSugarStatus(latestVital?.bloodSugar);

  // Compliance calculations
  const takenMeds = meds.filter(m => m.takenToday).length;
  const totalMeds = meds.length;
  const medCompliancePercent = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 100;

  // Dynamic design variables based on the active theme
  const getThemeClasses = () => {
    switch (theme) {
      case "dark":
        return {
          bannerBg: "bg-[#0A192F] border border-[#122A4E] text-white shadow-xl",
          bannerBadge: "bg-[#DC2626]/20 border border-[#DC2626]/40 text-[#DC2626]",
          bannerText: "text-slate-300",
          tipBg: "bg-[#0A192F] border-l-4 border-l-[#DC2626] border-y border-r border-[#122A4E] rounded-r-2xl shadow-sm",
          tipIconContainer: "bg-[#122A4E] text-[#DC2626] border border-[#1E3F66]",
          tipHeader: "text-white font-bold",
          tipBadge: "bg-[#122A4E] text-slate-300 border border-[#1E3F66]",
          tipRefresh: "text-white hover:bg-[#122A4E] p-2 rounded-full transition-all",
          ringColor: "#DC2626", // Crimson Red
          iconColor: "text-[#DC2626]",
          btnPrimary: "bg-[#DC2626] text-white hover:bg-[#B91C1C] font-bold shadow-xs transition-colors",
          btnSecondary: "bg-[#122A4E] text-white hover:bg-[#0A192F] border border-[#1E3F66]",
          cardBg: "bg-[#0A192F] border border-[#122A4E]",
          textPrimary: "text-white",
          textSecondary: "text-slate-400",
          borderColor: "border-[#122A4E]",
          badgeColor: "bg-[#122A4E] border border-[#1E3F66] text-[#DC2626]"
        };
      case "light":
      default:
        return {
          bannerBg: "bg-gradient-to-br from-[#0A192F] via-[#102A4F] to-[#0A192F] text-white shadow-md",
          bannerBadge: "bg-[#DC2626] text-white border border-[#DC2626]",
          bannerText: "text-slate-200",
          tipBg: "bg-white border-l-4 border-l-[#DC2626] border-y border-r border-slate-200 rounded-r-2xl shadow-xs",
          tipIconContainer: "bg-red-50 text-[#DC2626] border border-red-100",
          tipHeader: "text-[#000000] font-bold",
          tipBadge: "bg-red-50 text-[#DC2626] text-[10px] px-2 py-0.5 rounded-full font-bold border border-red-100",
          tipRefresh: "text-[#DC2626] hover:text-[#B91C1C] hover:bg-red-50 p-2 rounded-full transition-all",
          ringColor: "#DC2626", // Crimson Red
          iconColor: "text-[#DC2626]",
          btnPrimary: "bg-[#DC2626] text-white hover:bg-[#B91C1C] font-bold shadow-xs transition-colors",
          btnSecondary: "bg-white text-[#000000] hover:bg-slate-50 border border-slate-200",
          cardBg: "bg-white border border-slate-200 shadow-xs",
          textPrimary: "text-[#000000]",
          textSecondary: "text-[#6B7280]",
          borderColor: "border-slate-200",
          badgeColor: "bg-red-50 border border-red-100 text-[#DC2626]"
        };
    }
  };

  const style = getThemeClasses();

  // Helper to parse markdown bold/italic tags cleanly without raw asterisks
  const parseInlineFormatting = (textStr: string) => {
    const tokens = textStr.split(/(\*\*.*?\*\*|\*.*?\*|__.*?__|_[^_]+_)/g);
    return tokens.map((token, index) => {
      if ((token.startsWith("**") && token.endsWith("**")) || (token.startsWith("__") && token.endsWith("__"))) {
        const cleanText = token.slice(2, -2);
        return <strong key={index} className="font-bold text-slate-900 dark:text-white">{cleanText}</strong>;
      }
      if ((token.startsWith("*") && token.endsWith("*")) || (token.startsWith("_") && token.endsWith("_"))) {
        const cleanText = token.slice(1, -1);
        return <span key={index} className="italic text-slate-800 dark:text-slate-200 font-semibold">{cleanText}</span>;
      }
      return token;
    });
  };

  const renderFormattedTip = (text: string) => {
    if (!text) return null;

    // Remove system notes like *(Note:...)* or (Note:...)
    let cleaned = text
      .replace(/\*?\(Note:.*?\)\*?/gi, "")
      .replace(/Offline Fallback Mode.*?\)/gi, "")
      .trim();

    if (!cleaned) {
      cleaned = "Take small steps every day towards wellness and health maintenance.";
    }

    const lines = cleaned.split("\n").map(l => l.trim()).filter(Boolean);

    if (lines.length > 1) {
      return (
        <div className="space-y-1.5 mt-1 text-xs md:text-sm text-slate-700 dark:text-slate-300 font-medium">
          {lines.map((line, idx) => {
            const bulletMatch = line.match(/^[-*•]\s+(.*)$/);
            if (bulletMatch) {
              return (
                <div key={idx} className="flex items-start space-x-2 my-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] mt-1.5 shrink-0" />
                  <div className="flex-1 leading-snug">
                    {parseInlineFormatting(bulletMatch[1])}
                  </div>
                </div>
              );
            }
            const numberMatch = line.match(/^(\d+)[\.\)]\s+(.*)$/);
            if (numberMatch) {
              return (
                <div key={idx} className="flex items-start space-x-2 my-1">
                  <span className="inline-flex items-center justify-center bg-red-100 dark:bg-red-950 text-[#DC2626] font-bold text-[10px] min-w-[18px] h-4 px-1 rounded-md shrink-0 mt-0.5">
                    {numberMatch[1]}
                  </span>
                  <div className="flex-1 leading-snug">
                    {parseInlineFormatting(numberMatch[2])}
                  </div>
                </div>
              );
            }
            return (
              <p key={idx} className="leading-snug">
                {parseInlineFormatting(line)}
              </p>
            );
          })}
        </div>
      );
    }

    return (
      <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-relaxed mt-1">
        {parseInlineFormatting(cleaned)}
      </p>
    );
  };

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Welcome Banner */}
      <div className={`${style.bannerBg} p-6 rounded-2xl shadow-md relative overflow-hidden`} id="welcome-banner">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center pr-8 pointer-events-none">
          <Activity size={180} />
        </div>
        <div className="relative z-10 space-y-2">
          <div className={`flex items-center space-x-2 ${style.bannerBadge} w-fit px-3 py-1 rounded-full text-xs font-semibold`}>
            <Award size={14} />
            <span>AuraHealth AI Companion</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight font-sans">
            Namaste, {profile.name || "Sathi"}!
          </h1>
          <p className={`${style.bannerText} text-sm max-w-xl font-medium`}>
            Welcome to your wellness dashboard. Track your health journey, monitor your vital statistics, and receive expert AI support.
          </p>
        </div>
      </div>

      {/* AI Tip of the Day */}
      <div className={`${style.tipBg} p-5 shadow-xs flex items-start space-x-4 relative`} id="ai-tip-widget">
        <div className={`p-2.5 rounded-lg shrink-0 ${style.tipIconContainer}`}>
          <Sparkles size={20} className="animate-pulse" />
        </div>
        <div className="space-y-1 pr-12">
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-bold uppercase tracking-wider font-sans ${style.tipHeader}`}>AI Daily Wellness Tip</span>
            <span className={style.tipBadge}>Ayurvedic & Modern Science</span>
          </div>
          {renderFormattedTip(healthTip)}
        </div>
        <button 
          onClick={fetchAiTip}
          disabled={loadingTip}
          className={`absolute right-4 top-4 ${style.tipRefresh}`}
          title="Refresh AI wellness hack"
          id="refresh-tip-btn"
        >
          <RefreshCw size={16} className={loadingTip ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Grid: 2 Quick Metric Circles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="metrics-grid">
        {/* Steps Tracker */}
        <div className={`${style.cardBg} p-5 rounded-2xl border ${style.borderColor} shadow-sm flex items-center justify-between`}>
          <div className="space-y-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${style.textSecondary}`}>Active Steps</span>
            <h3 className={`text-2xl font-bold font-sans ${style.textPrimary}`}>
              {metrics.steps.toLocaleString()} <span className="text-sm text-slate-400 font-normal">/ {metrics.stepsTarget.toLocaleString()}</span>
            </h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => onIncrementSteps(1000)}
                className={`${style.btnSecondary} text-xs px-2.5 py-1.5 rounded-lg font-bold transition-colors`}
                id="walk-quick-btn"
              >
                +1,000 steps
              </button>
              <button 
                onClick={() => onIncrementSteps(5000)}
                className={`${style.btnPrimary} text-xs px-2.5 py-1.5 rounded-lg font-bold transition-colors`}
                id="walk-major-btn"
              >
                +5,000 steps
              </button>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="#f1f5f9" className="dark:stroke-slate-700" strokeWidth="4" fill="transparent" />
              <circle cx="32" cy="32" r="28" stroke={theme === "dark" ? "#ffffff" : "#000000"} strokeWidth="4" fill="transparent"
                strokeDasharray={175.9}
                strokeDashoffset={175.9 - (Math.min(metrics.steps / metrics.stepsTarget, 1) * 175.9)}
                strokeLinecap="round"
              />
            </svg>
            <Flame className={`absolute ${theme === "dark" ? "text-white" : "text-black"}`} size={18} />
          </div>
        </div>

        {/* Sleep Tracker */}
        <div className={`${style.cardBg} p-5 rounded-2xl border ${style.borderColor} shadow-sm flex items-center justify-between`}>
          <div className="space-y-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${style.textSecondary}`}>Sleep Duration</span>
            <h3 className={`text-2xl font-bold font-sans ${style.textPrimary}`}>
              {metrics.sleepHours} <span className="text-sm text-slate-400 font-normal">/ {metrics.sleepTarget} hrs</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">Rest well to rejuvenate cellular immunity.</p>
            <button 
              onClick={() => onNavigate("trackers")}
              className={`text-xs font-bold flex items-center space-x-0.5 ${theme === "dark" ? "text-white hover:text-slate-300" : "text-black hover:text-slate-700"}`}
              id="log-sleep-dash-btn"
            >
              <span>Manage trackers</span>
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="relative flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="#f1f5f9" className="dark:stroke-slate-700" strokeWidth="4" fill="transparent" />
              <circle cx="32" cy="32" r="28" stroke={theme === "dark" ? "#ffffff" : "#000000"} strokeWidth="4" fill="transparent"
                strokeDasharray={175.9}
                strokeDashoffset={175.9 - (Math.min(metrics.sleepHours / metrics.sleepTarget, 1) * 175.9)}
                strokeLinecap="round"
              />
            </svg>
            <Clock className={`absolute ${theme === "dark" ? "text-white" : "text-black"}`} size={18} />
          </div>
        </div>
      </div>

      {/* Main Core Section: Vitals Status & Active Medication Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="vitals-meds-section">
        {/* Vitals Board */}
        <div className={`${style.cardBg} p-6 rounded-2xl border ${style.borderColor} shadow-sm lg:col-span-7 space-y-4`} id="vitals-dashboard-card">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <div className="flex items-center space-x-2">
              <Activity className={theme === "dark" ? "text-white" : "text-black"} size={20} />
              <h2 className={`font-semibold text-base font-sans ${style.textPrimary}`}>Latest Vitals Summary</h2>
            </div>
            <button 
              onClick={() => onNavigate("vitals")}
              className={`text-xs font-bold flex items-center space-x-1 ${theme === "dark" ? "text-white hover:text-slate-300" : "text-black hover:text-slate-700"}`}
              id="log-vitals-dash-btn"
            >
              <span>+ Log Vitals</span>
            </button>
          </div>

          {latestVital ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Blood Pressure</span>
                  <p className="text-xl font-bold text-slate-800 font-sans mt-1">
                    {latestVital.bloodPressureSystolic}/{latestVital.bloodPressureDiastolic} <span className="text-xs text-slate-400 font-normal">mmHg</span>
                  </p>
                </div>
                <div className={`mt-2 text-[10px] w-fit font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${bpStatus.color}`}>
                  {bpStatus.label}
                </div>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Blood Sugar (Fasting)</span>
                  <p className="text-xl font-bold text-slate-800 font-sans mt-1">
                    {latestVital.bloodSugar || "—"} <span className="text-xs text-slate-400 font-normal">mg/dL</span>
                  </p>
                </div>
                <div className={`mt-2 text-[10px] w-fit font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${sugarStatus.color}`}>
                  {sugarStatus.label}
                </div>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Heart Rate</span>
                <p className="text-xl font-bold text-slate-800 font-sans mt-1 flex items-center space-x-2">
                  <Heart className="text-red-500 fill-red-500 animate-pulse" size={16} />
                  <span>{latestVital.heartRate || "—"} <span className="text-xs text-slate-400 font-normal">BPM</span></span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Normal target rest rate is 60–100.</p>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Weight & BMI</span>
                <p className="text-xl font-bold text-slate-800 font-sans mt-1">
                  {latestVital.weight || "—"} <span className="text-xs text-slate-400 font-normal">kg</span>
                </p>
                {latestVital.weight && latestVital.height ? (
                  <p className="text-[10px] text-blue-700 font-bold mt-1">
                    Calculated BMI: {(latestVital.weight / Math.pow(latestVital.height / 100, 2)).toFixed(1)}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Provide weight and height to view BMI.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <AlertCircle className="mx-auto text-slate-300" size={32} />
              <p className="text-sm">No vital signs logged for today.</p>
              <button 
                onClick={() => onNavigate("vitals")}
                className="bg-blue-600 text-white hover:bg-blue-700 text-xs px-3 py-1.5 rounded-lg font-bold transition-colors"
                id="log-first-vital-btn"
              >
                Log your first vital now
              </button>
            </div>
          )}
        </div>

        {/* Medication Compliance Dashboard */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-5 space-y-4" id="meds-dashboard-card">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="text-blue-600" size={20} />
              <h2 className="font-semibold text-base text-slate-800 font-sans">Daily Medications</h2>
            </div>
            <button 
              onClick={() => onNavigate("medications")}
              className="text-xs font-bold text-blue-600 hover:text-blue-800"
              id="manage-meds-dash-btn"
            >
              Manage ({totalMeds})
            </button>
          </div>

          <div className="space-y-3">
            {totalMeds > 0 ? (
              <>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span>Reminders taken: {takenMeds} of {totalMeds}</span>
                  <span className="text-blue-600">{medCompliancePercent}% Compliance</span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {meds.map((med) => (
                    <div 
                      key={med.id} 
                      onClick={() => onToggleMed(med.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        med.takenToday 
                          ? "bg-blue-50/20 border-blue-100 text-slate-400 line-through" 
                          : "bg-white border-slate-100 hover:border-blue-200 text-slate-700"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold">{med.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">
                          {med.dosage} • {med.timeOfDay} • {med.frequency}
                        </p>
                      </div>
                      <div className={`p-1 rounded-full ${med.takenToday ? "text-blue-600" : "text-slate-300 hover:text-slate-400"}`}>
                        <CheckCircle2 size={18} fill={med.takenToday ? "currentColor" : "none"} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <Clock className="mx-auto text-slate-300" size={32} />
                <p className="text-sm">No medication reminder schedules added.</p>
                <button 
                  onClick={() => onNavigate("medications")}
                  className="bg-blue-600 text-white hover:bg-blue-700 text-xs px-3 py-1.5 rounded-lg font-bold transition-colors"
                  id="add-med-dash-btn"
                >
                  Add Medicine Alert
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Symptom Checker & Emergency Protocol Prompt */}
      <div className="bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 p-5 rounded-2xl shadow-xs space-y-3" id="dashboard-bottom-grid">
        <div className="flex items-center space-x-2 text-orange-900 dark:text-orange-400 font-bold text-xs uppercase tracking-wider">
          <ShieldAlert size={18} className="text-[#DC2626]" />
          <span>Symptom Checker & Emergency Protocol</span>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          Experiencing unexpected symptoms like cold, mild fever, or headache? Log them in our Symptom Assessor to triage safely. For severe conditions, seek immediate healthcare.
        </p>
        <button 
          onClick={() => onNavigate("symptoms")}
          className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center space-x-1"
          id="triage-symptoms-btn"
        >
          <span>Start AI Symptom Assessor</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

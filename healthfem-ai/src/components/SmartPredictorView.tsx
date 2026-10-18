import React, { useState } from "react";
import { 
  Sparkles, RefreshCw, Sliders, TrendingUp, HelpCircle, 
  Heart, Zap, ShieldCheck, Info, ChevronRight, Activity, ArrowRight, Gauge
} from "lucide-react";
import { HealthProfile, HealthMetrics, SmartPredictorResult } from "../types";

interface SmartPredictorViewProps {
  profile: HealthProfile;
  metrics: HealthMetrics;
  theme: "light" | "dark";
}

export default function SmartPredictorView({ profile, metrics, theme }: SmartPredictorViewProps) {
  const [simulatedSteps, setSimulatedSteps] = useState(metrics.steps || 8000);
  const [simulatedSleep, setSimulatedSleep] = useState(metrics.sleepHours || 7.5);
  const [simulationFocus, setSimulationFocus] = useState("Cardiovascular Endurance");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartPredictorResult | null>(null);
  const [error, setError] = useState("");

  const handleRunSimulation = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/smart-wellness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          simulatedMetrics: {
            steps: simulatedSteps,
            sleepHours: simulatedSleep
          },
          focus: simulationFocus
        })
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to calculate simulation.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Unable to reach the prediction server. Please make sure the server is online.");
    } finally {
      setLoading(false);
    }
  };

  const getStyleClasses = () => {
    if (theme === "dark") {
      return {
        cardBg: "bg-[#0A192F] border border-[#122A4E]",
        textPrimary: "text-white",
        textSecondary: "text-slate-300",
        border: "border-[#122A4E]",
        badge: "bg-[#122A4E] border border-[#1E3F66] text-white",
        accentBg: "bg-[#122A4E]/50 border border-[#1E3F66]",
        btnPrimary: "bg-[#DC2626] text-white hover:bg-[#B91C1C]",
        btnSecondary: "bg-[#122A4E] text-slate-200 border border-[#1E3F66] hover:bg-[#0A192F]",
        sliderTrack: "bg-[#122A4E]",
        sliderFill: "bg-[#DC2626]",
        textMuted: "text-slate-400",
        panelHeader: "border-b border-[#122A4E]",
        gridLine: "#1e293b",
      };
    }
    return {
      cardBg: "bg-white border border-slate-200 shadow-xs",
      textPrimary: "text-[#000000]",
      textSecondary: "text-[#6B7280]",
      border: "border-slate-200",
      badge: "bg-red-50 border border-red-100 text-[#DC2626]",
      accentBg: "bg-red-50/50 border border-red-100",
      btnPrimary: "bg-[#DC2626] text-white hover:bg-[#B91C1C]",
      btnSecondary: "bg-white text-[#000000] border border-slate-200 hover:bg-slate-50",
      sliderTrack: "bg-slate-200",
      sliderFill: "bg-[#DC2626]",
      textMuted: "text-[#6B7280]",
      panelHeader: "border-b border-slate-150",
      gridLine: "#e2e8f0",
    };
  };

  const style = getStyleClasses();

  // Helper to draw clean inline SVG lines for the trajectory forecast chart
  const renderTrendChart = (data: any[]) => {
    if (!data || data.length === 0) return null;
    
    const width = 450;
    const height = 180;
    const padding = 30;
    
    // Values range bounds
    const minHR = Math.min(...data.map(d => d.restingHeartRate)) - 2;
    const maxHR = Math.max(...data.map(d => d.restingHeartRate)) + 2;
    const minStress = Math.min(...data.map(d => d.stressIndex)) - 5;
    const maxStress = Math.max(...data.map(d => d.stressIndex)) + 5;
    const minEnergy = Math.min(...data.map(d => d.energyLevel)) - 5;
    const maxEnergy = Math.max(...data.map(d => d.energyLevel)) + 5;

    // Helper coordinates mapping functions
    const getX = (index: number) => padding + (index * (width - 2 * padding) / (data.length - 1));
    const getY = (val: number, min: number, max: number) => {
      const range = max - min || 1;
      return height - padding - ((val - min) * (height - 2 * padding) / range);
    };

    // Construct SVG path strings
    let hrPath = "";
    let stressPath = "";
    let energyPath = "";

    data.forEach((d, i) => {
      const x = getX(i);
      const yHR = getY(d.restingHeartRate, minHR, maxHR);
      const yStress = getY(d.stressIndex, minStress, maxStress);
      const yEnergy = getY(d.energyLevel, minEnergy, maxEnergy);

      if (i === 0) {
        hrPath = `M ${x} ${yHR}`;
        stressPath = `M ${x} ${yStress}`;
        energyPath = `M ${x} ${yEnergy}`;
      } else {
        hrPath += ` L ${x} ${yHR}`;
        stressPath += ` L ${x} ${yStress}`;
        energyPath += ` L ${x} ${yEnergy}`;
      }
    });

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto font-sans" id="simulation-svg-chart">
        {/* Horizontal grid lines */}
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke={style.gridLine} strokeDasharray="3,3" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke={style.gridLine} strokeDasharray="3,3" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke={style.gridLine} strokeDasharray="3,3" />

        {/* Resting Heart Rate (Deep Dark Blue/Black in Light, Bright Blue in Dark) */}
        <path d={hrPath} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {/* Stress Index (Black or Slate in Light, White in Dark) */}
        <path d={stressPath} fill="none" stroke={theme === "dark" ? "#ffffff" : "#0f172a"} strokeWidth="2.5" strokeDasharray="4,3" strokeLinecap="round" />
        {/* Energy Level (Bright Electric Sky Blue) */}
        <path d={energyPath} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />

        {/* Data points */}
        {data.map((d, i) => {
          const x = getX(i);
          const yHR = getY(d.restingHeartRate, minHR, maxHR);
          const yStress = getY(d.stressIndex, minStress, maxStress);
          const yEnergy = getY(d.energyLevel, minEnergy, maxEnergy);

          return (
            <g key={i}>
              {/* HR circle */}
              <circle cx={x} cy={yHR} r="4" fill="#2563eb" className="hover:r-6 cursor-pointer" />
              {/* Stress circle */}
              <circle cx={x} cy={yStress} r="4" fill={theme === "dark" ? "#ffffff" : "#0f172a"} />
              {/* Energy circle */}
              <circle cx={x} cy={yEnergy} r="4" fill="#3b82f6" />
              
              {/* Label below axis */}
              <text x={x} y={height - 8} fontSize="9" fontWeight="bold" fill={theme === "dark" ? "#94a3b8" : "#64748b"} textAnchor="middle">
                Wk {d.week}
              </text>
            </g>
          );
        })}

        {/* Chart Y-Axis legend indicators */}
        <text x={padding - 5} y={padding + 5} fontSize="8" fontWeight="bold" fill="#2563eb" textAnchor="end">MAX</text>
        <text x={padding - 5} y={height - padding + 3} fontSize="8" fontWeight="bold" fill="#2563eb" textAnchor="end">MIN</text>
      </svg>
    );
  };

  return (
    <div className="space-y-6" id="smart-predictor-root">
      {/* Banner Intro block strictly White, Black, and Blue */}
      <div className={`p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-blue-950 to-black text-white border border-slate-800 shadow-md`} id="smart-banner">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 bg-blue-900/40 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold text-blue-300">
              <Sparkles size={12} className="animate-spin text-blue-300" />
              <span>Interactive AI Forecasting Tool</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black font-sans tracking-tight">
              Biometric Habit Simulator & Forecast Engine
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Adjust your daily active movement and sleep parameters below. Our <strong>Gemini Predictive Model</strong> will calculate how your personal biometrics (resting heart rate, chronic stress, vitality quotient) will evolve over a 12-week clinical trajectory, alongside an Ayurvedic constitutional Dosha breakdown.
            </p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
              <TrendingUp size={28} className="text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="predictor-main-grid">
        {/* Column 1: Simulator Inputs & Sliders */}
        <div className={`${style.cardBg} p-6 rounded-2xl shadow-xs lg:col-span-5 space-y-5`} id="predictor-inputs">
          <div className={`flex items-center space-x-2 pb-3 ${style.panelHeader}`}>
            <Sliders className="text-blue-600" size={20} />
            <h2 className={`font-semibold text-base font-sans ${style.textPrimary}`}>Configure Target Habits</h2>
          </div>

          <div className="space-y-5">
            {/* Steps Goal slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-[10px]">1. Daily Movement Goal</span>
                <span className={`font-mono font-bold ${style.textPrimary}`}>{simulatedSteps.toLocaleString()} Steps</span>
              </div>
              <input 
                type="range"
                min={2000}
                max={20000}
                step={500}
                value={simulatedSteps}
                onChange={(e) => setSimulatedSteps(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg cursor-pointer accent-blue-600 focus:outline-hidden"
                id="slider-steps"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                <span>Sedentary (2k)</span>
                <span>Active (10k)</span>
                <span>Athletic (20k)</span>
              </div>
            </div>

            {/* Sleep Goal slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-[10px]">2. Target Daily Sleep</span>
                <span className={`font-mono font-bold ${style.textPrimary}`}>{simulatedSleep} Hours</span>
              </div>
              <input 
                type="range"
                min={4}
                max={11}
                step={0.5}
                value={simulatedSleep}
                onChange={(e) => setSimulatedSleep(parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg cursor-pointer accent-blue-600 focus:outline-hidden"
                id="slider-sleep"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                <span>Minimal (4h)</span>
                <span>Optimal (7-8h)</span>
                <span>Extended (11h)</span>
              </div>
            </div>

            {/* Intervention Selection drop box */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">3. Main Biometric Focus Area</label>
              <select
                value={simulationFocus}
                onChange={(e) => setSimulationFocus(e.target.value)}
                className={`w-full bg-transparent border rounded-xl px-3 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${style.border} ${style.textPrimary}`}
                id="predictor-focus-dropdown"
              >
                <option value="Cardiovascular Endurance" className="bg-white dark:bg-slate-900">Cardiovascular Endurance (Heart & Lung Vitality)</option>
                <option value="Metabolic Acceleration" className="bg-white dark:bg-slate-900">Metabolic Acceleration (Weight Tuning & Immunity)</option>
                <option value="Stress Harmonics & Sleep" className="bg-white dark:bg-slate-900">Stress Harmonics & Deep Sleep (Nervous System Recovery)</option>
                <option value="Ayurvedic Tridosha Balancing" className="bg-white dark:bg-slate-900">Ayurvedic Tridosha Balancing (Pitta, Vata, Kapha Harmony)</option>
              </select>
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={loading}
              className={`w-full text-xs font-bold py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-xs cursor-pointer disabled:opacity-50 ${style.btnPrimary}`}
              id="btn-run-simulation"
            >
              {loading ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
              <span>{loading ? "AI is running bio-forecasting models..." : "Generate AI Wellness Projection"}</span>
            </button>

            {error && (
              <div className="p-3.5 rounded-xl bg-blue-50/20 border border-blue-900/30 text-xs text-blue-400 font-medium" id="simulation-error">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Simulation outputs & Charts */}
        <div className={`${style.cardBg} lg:col-span-7 p-6 rounded-2xl shadow-xs flex flex-col justify-between`} id="predictor-outputs-panel">
          {result ? (
            <div className="space-y-6 animate-fade-in" id="predictor-results-loaded">
              
              {/* Header metrics */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 ${style.panelHeader}`}>
                <div className="space-y-1">
                  <h3 className={`font-extrabold text-base font-sans ${style.textPrimary}`}>Simulation Analysis Completed</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">12-Week predictive biometric modeling</p>
                </div>
                
                {/* Big Score block */}
                <div className={`px-4 py-2 rounded-2xl text-center flex items-center space-x-3 shrink-0 ${style.accentBg}`}>
                  <Gauge size={22} className="text-blue-600" />
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[8px]">Predicted Score</div>
                    <div className="text-xl font-black text-blue-600 dark:text-blue-400 font-sans tracking-tight">
                      {result.wellnessScore}<span className="text-xs text-slate-400">/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic SVGs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                
                {/* Trajectory line plot */}
                <div className="md:col-span-7 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">12-Week Trajectory Trends</span>
                  <div className={`p-2 rounded-xl border ${style.border}`}>
                    {renderTrendChart(result.forecastWeeks)}
                  </div>
                  {/* Legend indicator */}
                  <div className="flex items-center justify-center space-x-3.5 text-[9px] font-bold uppercase tracking-wider py-1">
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-0.5 bg-blue-600 inline-block"></span>
                      <span className={style.textSecondary}>Rest HR</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-0.5 border-t border-dashed border-slate-900 dark:border-white inline-block"></span>
                      <span className={style.textSecondary}>Stress Index</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-0.5 bg-blue-400 inline-block"></span>
                      <span className={style.textSecondary}>Energy Index</span>
                    </span>
                  </div>
                </div>

                {/* Ayurvedic Dosha Balance */}
                <div className="md:col-span-5 space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Simulated Dosha Balance</span>
                  <div className="space-y-3">
                    {/* Vata bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className={style.textPrimary}>Vata (Air/Space)</span>
                        <span className="text-blue-500">{result.doshaVata}%</span>
                      </div>
                      <div className={`w-full h-2 rounded-full ${style.sliderTrack}`}>
                        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${result.doshaVata}%` }}></div>
                      </div>
                    </div>
                    {/* Pitta bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className={style.textPrimary}>Pitta (Fire/Water)</span>
                        <span className="text-slate-900 dark:text-white">{result.doshaPitta}%</span>
                      </div>
                      <div className={`w-full h-2 rounded-full ${style.sliderTrack}`}>
                        <div className="h-2 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${result.doshaPitta}%` }}></div>
                      </div>
                    </div>
                    {/* Kapha bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className={style.textPrimary}>Kapha (Earth/Water)</span>
                        <span className="text-blue-400">{result.doshaKapha}%</span>
                      </div>
                      <div className={`w-full h-2 rounded-full ${style.sliderTrack}`}>
                        <div className="h-2 rounded-full bg-blue-400" style={{ width: `${result.doshaKapha}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Personalized insights */}
              <div className={`p-4 rounded-xl border space-y-2.5 ${style.accentBg}`}>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 font-sans">
                  <Zap size={14} />
                  <span>Targeted Smart Bio-Insights</span>
                </div>
                <ul className="text-xs space-y-2 text-slate-700 dark:text-slate-300 list-disc pl-4.5 font-medium leading-relaxed">
                  {result.insights.map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ))}
                </ul>
              </div>

              {/* Ayurvedic Analysis and Projected Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium leading-relaxed">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Ayurvedic Harmony Analysis</span>
                  <p className={style.textSecondary}>{result.ayurvedicAnalysis}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Expected Bio-Benefits</span>
                  <p className={style.textSecondary}>{result.projectedBenefits}</p>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-20 space-y-4 my-auto text-slate-400 dark:text-slate-500 max-w-sm mx-auto" id="predictor-placeholder">
              <Gauge className="mx-auto text-slate-300 dark:text-slate-600 animate-pulse" size={56} />
              <div className="space-y-2">
                <h4 className={`font-bold font-sans ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>No simulation run yet</h4>
                <p className="text-xs leading-relaxed font-medium">
                  Use the habit simulator sliders on the left panel to configure daily targets, select your main wellness focus area, and hit <strong>Generate AI Wellness Projection</strong> to forecast your future biometric improvements.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

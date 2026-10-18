import React, { useState } from "react";
import { 
  Plus, Activity, Heart, Thermometer, User, Trash2, 
  AlertTriangle, ShieldCheck, CheckCircle2, AlertOctagon 
} from "lucide-react";
import { VitalRecord } from "../types";

interface VitalsViewProps {
  vitals: VitalRecord[];
  onAddVital: (record: Omit<VitalRecord, "id" | "timestamp">) => void;
  onDeleteVital: (id: string) => void;
}

export default function VitalsView({ vitals, onAddVital, onDeleteVital }: VitalsViewProps) {
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [sugar, setSugar] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [temperature, setTemperature] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!systolic && !diastolic && !sugar && !heartRate && !weight && !height && !temperature) {
      setError("Please enter at least one metric to log!");
      return;
    }

    onAddVital({
      bloodPressureSystolic: systolic ? parseInt(systolic) : undefined,
      bloodPressureDiastolic: diastolic ? parseInt(diastolic) : undefined,
      bloodSugar: sugar ? parseInt(sugar) : undefined,
      heartRate: heartRate ? parseInt(heartRate) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      height: height ? parseFloat(height) : undefined,
      temperature: temperature ? parseFloat(temperature) : undefined,
    });

    // Clear form and error
    setError(null);
    setSystolic("");
    setDiastolic("");
    setSugar("");
    setHeartRate("");
    setWeight("");
    setHeight("");
    setTemperature("");
  };

  // Perform quick clinical assessments to display alerts
  const checkVitalsForAlerts = (v: VitalRecord) => {
    const alerts: { text: string; severity: "warning" | "danger" }[] = [];

    if (v.bloodPressureSystolic && v.bloodPressureDiastolic) {
      if (v.bloodPressureSystolic >= 140 || v.bloodPressureDiastolic >= 90) {
        alerts.push({ text: `High Blood Pressure (${v.bloodPressureSystolic}/${v.bloodPressureDiastolic} mmHg). Recheck after resting and consult a clinician if persistent.`, severity: "danger" });
      } else if (v.bloodPressureSystolic >= 120 && v.bloodPressureSystolic <= 139) {
        alerts.push({ text: `Elevated Blood Pressure (${v.bloodPressureSystolic}/${v.bloodPressureDiastolic} mmHg). Focus on a low-sodium diet and daily walking.`, severity: "warning" });
      }
    }

    if (v.bloodSugar) {
      if (v.bloodSugar >= 126) {
        alerts.push({ text: `High Fasting Blood Sugar (${v.bloodSugar} mg/dL). This is in the diabetic threshold. Consult your doctor.`, severity: "danger" });
      } else if (v.bloodSugar >= 100 && v.bloodSugar < 126) {
        alerts.push({ text: `Elevated Fasting Blood Sugar (${v.bloodSugar} mg/dL). Indicates prediabetic levels. Reduce refined sugar intake.`, severity: "warning" });
      }
    }

    if (v.heartRate) {
      if (v.heartRate > 100) {
        alerts.push({ text: `Resting Tachycardia (Heart Rate: ${v.heartRate} BPM). Ensure you are hydrated. Reduce stress and caffeine.`, severity: "warning" });
      } else if (v.heartRate < 55) {
        alerts.push({ text: `Resting Bradycardia (Heart Rate: ${v.heartRate} BPM). Normal for athletes; if accompanied by fatigue or dizziness, consult a physician.`, severity: "warning" });
      }
    }

    if (v.temperature) {
      if (v.temperature > 100.4) {
        alerts.push({ text: `Fever detected (${v.temperature}°F). Rest well, keep hydrated, and log symptoms in our assessor.`, severity: "danger" });
      }
    }

    return alerts;
  };

  const calculateBmi = (weightKg?: number, heightCm?: number) => {
    if (!weightKg || !heightCm) return null;
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    
    let status = "";
    let color = "";
    if (bmi < 18.5) {
      status = "Underweight";
      color = "text-orange-700 bg-orange-50 border-orange-100 dark:bg-orange-950/20 dark:text-orange-300 dark:border-orange-900";
    } else if (bmi < 25) {
      status = "Healthy weight";
      color = "text-blue-700 bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900";
    } else if (bmi < 30) {
      status = "Overweight";
      color = "text-orange-700 bg-orange-50/50 border-orange-100 dark:bg-orange-950/10 dark:text-orange-400 dark:border-orange-900";
    } else {
      status = "Obese";
      color = "text-red-700 bg-red-50 border-red-200 dark:bg-[#DC2626]/20 dark:text-red-300 dark:border-[#DC2626]/40 font-bold";
    }

    return { val: bmi.toFixed(1), status, color };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="vitals-section-container">
      {/* Column 1: Log form */}
      <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-5 space-y-4" id="log-vitals-form-card">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Activity className="text-[#DC2626]" size={20} />
          <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-100 font-sans">Log Today's Vital Signs</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" id="vitals-form">
          {error && (
            <div className="p-3 bg-[#DC2626] text-white border border-[#DC2626] rounded-xl text-xs flex items-start space-x-2 animate-fade-in" id="vitals-error-banner">
              <span className="bg-white text-[#DC2626] text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shrink-0">ALERT</span>
              <span className="font-medium">{error}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">BP Systolic</label>
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                placeholder="e.g. 120"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#DC2626]"
                id="bp-systolic-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">BP Diastolic</label>
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                placeholder="e.g. 80"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#DC2626]"
                id="bp-diastolic-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sugar (Fasting)</label>
              <input
                type="number"
                value={sugar}
                onChange={(e) => setSugar(e.target.value)}
                placeholder="mg/dL"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#DC2626]"
                id="blood-sugar-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Heart Rate</label>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="BPM"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#DC2626]"
                id="heart-rate-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 70"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#DC2626]"
                id="weight-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 172"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#DC2626]"
                id="height-input"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Temperature (°F)</label>
            <input
              type="number"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="e.g. 98.6"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#DC2626]"
              id="temp-input"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold py-3.5 rounded-xl transition-all text-sm flex items-center justify-center space-x-1 shadow-md cursor-pointer"
            id="vitals-submit-btn"
          >
            <Plus size={16} />
            <span>Save Vital Metrics</span>
          </button>
        </form>
      </div>

      {/* Column 2: Historical log + Dynamic safety reviews */}
      <div className="lg:col-span-7 space-y-6" id="vitals-history-panel">
        {/* Real-time Physiological Warning Chips */}
        {vitals.length > 0 && (
          <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3" id="vitals-alert-center">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Biological Vital Warning Center</h3>
            {checkVitalsForAlerts(vitals[0]).length > 0 ? (
              <div className="space-y-2">
                {checkVitalsForAlerts(vitals[0]).map((alert, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-xl border flex items-start space-x-2 text-xs leading-relaxed ${
                      alert.severity === "danger" 
                        ? "bg-red-50 border-red-100 text-red-900 font-bold" 
                        : "bg-orange-50 border-orange-100 text-orange-900"
                    }`}
                  >
                    <AlertTriangle size={16} className="mt-0.5 text-[#DC2626] shrink-0" />
                    <span>{alert.text}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-blue-50 border border-blue-100 text-blue-800 dark:bg-blue-950/10 dark:border-blue-900 dark:text-blue-300 rounded-xl flex items-center space-x-2 text-xs font-bold">
                <ShieldCheck size={16} className="text-blue-600" />
                <span>All logged biological vitals are currently in optimal healthy zones! Keep it up.</span>
              </div>
            )}
          </div>
        )}

        {/* History Records */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4" id="vitals-history-card">
          <h2 className="font-semibold text-base text-slate-800 dark:text-slate-100 font-sans">Historical Vital Records</h2>
          {vitals.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {vitals.map((rec) => {
                const bmiData = calculateBmi(rec.weight, rec.height);
                return (
                  <div key={rec.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 hover:border-red-200 dark:hover:border-red-900 hover:bg-slate-50/20 dark:hover:bg-slate-900/10 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{rec.timestamp}</span>
                      <button 
                        onClick={() => onDeleteVital(rec.id)}
                        className="text-slate-400 hover:text-[#DC2626] p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                        id={`delete-vital-btn-${rec.id}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 dark:text-slate-300">
                      {rec.bloodPressureSystolic && (
                        <div className="bg-slate-50/50 dark:bg-slate-900/30 p-2 rounded-lg border border-slate-100/50 dark:border-slate-800/50">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">BP</p>
                          <p className="font-bold text-slate-800 dark:text-slate-150">{rec.bloodPressureSystolic}/{rec.bloodPressureDiastolic} mmHg</p>
                        </div>
                      )}
                      {rec.bloodSugar && (
                        <div className="bg-slate-50/50 dark:bg-slate-900/30 p-2 rounded-lg border border-slate-100/50 dark:border-slate-800/50">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Blood Sugar</p>
                          <p className="font-bold text-slate-800 dark:text-slate-150">{rec.bloodSugar} mg/dL</p>
                        </div>
                      )}
                      {rec.heartRate && (
                        <div className="bg-slate-50/50 dark:bg-slate-900/30 p-2 rounded-lg border border-slate-100/50 dark:border-slate-800/50">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Heart Rate</p>
                          <p className="font-bold text-slate-800 dark:text-slate-150">{rec.heartRate} BPM</p>
                        </div>
                      )}
                      {rec.temperature && (
                        <div className="bg-slate-50/50 dark:bg-slate-900/30 p-2 rounded-lg border border-slate-100/50 dark:border-slate-800/50">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Temp</p>
                          <p className="font-bold text-slate-800 dark:text-slate-150">{rec.temperature} °F</p>
                        </div>
                      )}
                    </div>

                    {bmiData && (
                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-bold">Calculated Body Mass Index (BMI):</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800 dark:text-slate-150">{bmiData.val}</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider border ${bmiData.color}`}>
                            {bmiData.status}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Heart size={36} className="mx-auto text-slate-300" />
              <p className="text-sm">No historical records saved. Start logging your daily vitals to view statistics and check Alert indicators.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

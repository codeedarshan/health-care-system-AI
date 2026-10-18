import React, { useState } from "react";
import { 
  ShieldCheck, AlertTriangle, Activity, AlertOctagon, RefreshCw, 
  Sparkles, CheckCircle2, FileText, Stethoscope, ChevronRight 
} from "lucide-react";
import { SymptomCheckResult } from "../types";

export default function SymptomView() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("1-2 Days");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SymptomCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const symptomList = [
    "Headache (सिरदर्द)",
    "Dry Cough (सूखी खांसी)",
    "Sore Throat (गले में खराश)",
    "Fatigue/Weakness (थकान और कमजोरी)",
    "Mild Fever (हल्का बुखार)",
    "Body/Muscle Pain (बदन दर्द)",
    "Nasal Congestion (बंद नाक)",
    "Indigestion/Stomach Pain (अपच या पेट दर्द)",
    "Nausea/Dizziness (घबराहट या चक्कर आना)",
    "Sleeplessness (नींद न आना)"
  ];

  const handleToggleSymptom = (symptom: string) => {
    setError(null);
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleAssess = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (selectedSymptoms.length === 0 && !description.trim()) {
      setError("Please select at least one symptom or describe how you feel below!");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/analyze-symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          description: description.trim(),
          duration
        })
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to analyze symptoms. Please re-check the system configuration.");
      }
    } catch (err) {
      console.error(err);
      setError("Error connecting to the symptom triage server. Please verify connections.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="symptom-view-grid">
      {/* Column 1: Symptom picker */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs lg:col-span-5 space-y-4" id="symptom-form-card">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-700 pb-2">
          <Stethoscope className="text-[#DC2626]" size={20} />
          <h2 className="font-semibold text-base text-slate-800 dark:text-slate-100 font-sans">AI Symptom Assessor & Triage</h2>
        </div>

        <form onSubmit={handleAssess} className="space-y-4" id="symptom-triage-form">
          {error && (
            <div className="p-3 bg-[#DC2626] text-white border border-[#DC2626] rounded-xl text-xs flex items-start space-x-2 animate-fade-in" id="symptom-error-banner">
              <span className="bg-white text-[#DC2626] text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shrink-0">ALERT</span>
              <span className="font-medium">{error}</span>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">1. Select Symptoms</label>
            <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
              {symptomList.map((sym, idx) => {
                const isChecked = selectedSymptoms.includes(sym);
                return (
                  <div 
                    key={idx} 
                    onClick={() => handleToggleSymptom(sym)}
                    className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isChecked 
                        ? "bg-red-50/50 dark:bg-[#DC2626]/10 border-red-200 dark:border-red-900/50 text-[#DC2626] dark:text-red-300 font-bold" 
                        : "bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-red-100 dark:hover:border-red-900"
                    }`}
                    id={`symptom-checkbox-${idx}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly
                      className="rounded border-slate-300 dark:border-slate-700 text-[#DC2626] focus:ring-[#DC2626]"
                    />
                    <span className="text-xs">{sym}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">2. Duration of Symptoms</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#DC2626]"
              id="duration-selector"
            >
              <option value="Just started today">Just started today</option>
              <option value="1-2 Days">1-2 Days</option>
              <option value="3-5 Days">3-5 Days</option>
              <option value="Over a week">Over a week</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">3. Describe How You Feel</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. My head hurts, and I feel slightly nauseated. Also feeling a bit cold and tired."
              rows={3}
              className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#DC2626]"
              id="description-textarea"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold py-3.5 rounded-xl transition-all text-sm flex items-center justify-center space-x-2 shadow-xs disabled:opacity-50 cursor-pointer"
            id="symptom-assess-submit"
          >
            {loading ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            <span>{loading ? "AuraHealth is triaging..." : "Assess Symptoms"}</span>
          </button>
        </form>
      </div>

      {/* Column 2: Assessment results */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between" id="symptom-results-panel">
        {result ? (
          <div className="space-y-5 animate-fade-in" id="symptom-results-content">
            {/* Severity Header Badge */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="space-y-0.5">
                <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100 font-sans">Triage Analysis Complete</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Calculated immediate wellness categorization</p>
              </div>

              {result.severity === "high" && (
                <div className="bg-[#DC2626] border border-[#DC2626] text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center space-x-1 shrink-0">
                  <AlertOctagon size={14} />
                  <span>High Priority</span>
                </div>
              )}
              {result.severity === "medium" && (
                <div className="bg-orange-600 border border-orange-500 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center space-x-1 shrink-0">
                  <AlertTriangle size={14} />
                  <span>Medium Severity</span>
                </div>
              )}
              {result.severity === "low" && (
                <div className="bg-blue-600 border border-blue-500 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center space-x-1 shrink-0">
                  <ShieldCheck size={14} />
                  <span>Low Severity</span>
                </div>
              )}
            </div>

            {/* Possible Causes card */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Common Possible Reasons</h4>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-5 font-medium leading-relaxed">
                {result.possibleCauses?.map((cause, idx) => (
                  <li key={idx}>{cause}</li>
                ))}
              </ul>
            </div>

            {/* Home Remedies card */}
            <div className="space-y-1.5 bg-red-50/40 dark:bg-red-950/10 p-4 border border-red-100 dark:border-red-900/50 rounded-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#DC2626] dark:text-red-400 font-sans flex items-center space-x-1">
                <Activity size={14} />
                <span>Recommended Home Care & Ayurvedic Remedies</span>
              </h4>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-5 font-medium mt-1">
                {result.homeRemedies?.map((rem, idx) => (
                  <li key={idx} className="leading-relaxed">{rem}</li>
                ))}
              </ul>
            </div>

            {/* AI clinical Guidance */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Guidance & Next Steps</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                {result.advice}
              </p>
            </div>

            {/* Doctor Triage Notice */}
            <div className={`p-4 rounded-xl border flex items-start space-x-2 text-xs leading-relaxed ${
              result.requiresDoctor 
                ? "bg-red-50 border-red-100 text-[#DC2626] font-bold" 
                : "bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900 text-slate-800 dark:text-slate-300 font-bold"
            }`}>
              {result.requiresDoctor ? (
                <>
                  <AlertOctagon size={16} className="text-[#DC2626] mt-0.5 shrink-0" />
                  <div>
                    <strong>Doctor Visit Advised:</strong> Your symptoms or description suggests checking in with a clinician. Please schedule an appointment.
                  </div>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} className="text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <strong>Home Care Suggested:</strong> Maintain hydration and follow the safe care steps. If symptoms persist beyond 3 days, see a doctor.
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 space-y-4 my-auto text-slate-400 dark:text-slate-500 max-w-sm mx-auto" id="no-symptom-placeholder">
            <Stethoscope className="mx-auto text-slate-300 dark:text-slate-600 animate-pulse" size={48} />
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 font-sans">No symptom log assessed yet</h4>
              <p className="text-xs leading-relaxed font-medium">
                Select active symptoms from the checker checklist, add a detailed description, and let our <strong>Gemini AI Assessor</strong> analyze your current physiological alerts.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

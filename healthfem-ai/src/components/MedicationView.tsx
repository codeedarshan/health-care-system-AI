import React, { useState } from "react";
import { 
  Clock, Plus, CheckCircle2, Circle, AlertCircle, Trash2, 
  Smile, ShieldAlert, Award, Calendar, RefreshCw 
} from "lucide-react";
import { Medication } from "../types";

interface MedicationViewProps {
  meds: Medication[];
  onAddMed: (med: Omit<Medication, "id" | "takenToday" | "takenLogs">) => void;
  onToggleMed: (id: string) => void;
  onDeleteMed: (id: string) => void;
  onResetMedsDaily: () => void;
}

export default function MedicationView({
  meds,
  onAddMed,
  onToggleMed,
  onDeleteMed,
  onResetMedsDaily
}: MedicationViewProps) {
  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("Once Daily");
  const [timeOfDay, setTimeOfDay] = useState("08:00 AM");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim() || !dosage.trim()) return;

    onAddMed({
      name: medName.trim(),
      dosage: dosage.trim(),
      frequency,
      timeOfDay
    });

    setMedName("");
    setDosage("");
  };

  const takenCount = meds.filter(m => m.takenToday).length;
  const totalCount = meds.length;
  const complianceRate = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="medications-view-container">
      {/* Column 1: Add new medicine form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-5 space-y-4" id="add-med-form-card">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
          <Clock className="text-[#DC2626]" size={20} />
          <h2 className="font-semibold text-base text-slate-800 font-sans">Schedule New Reminder</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" id="med-scheduler-form">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Medicine Name</label>
            <input
              type="text"
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              placeholder="e.g. Paracetamol or Multivitamin"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#DC2626]"
              required
              id="med-name-input"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dosage Specification</label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g. 500mg, 1 capsule, 10ml"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#DC2626]"
              required
              id="med-dosage-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#DC2626]"
                id="med-freq-select"
              >
                <option value="Once Daily">Once Daily</option>
                <option value="Twice Daily">Twice Daily</option>
                <option value="Three times daily">Three times daily</option>
                <option value="As Needed (SOS)">As Needed (SOS)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time of Day</label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#DC2626]"
                id="med-time-select"
              >
                <option value="07:00 AM">07:00 AM (Breakfast)</option>
                <option value="08:00 AM">08:00 AM</option>
                <option value="01:00 PM">01:00 PM (Lunch)</option>
                <option value="05:00 PM">05:00 PM (Tea time)</option>
                <option value="09:00 PM">09:00 PM (Dinner)</option>
                <option value="10:00 PM">10:00 PM (Bedtime)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold py-3.5 rounded-xl transition-all text-sm flex items-center justify-center space-x-1 shadow-md cursor-pointer"
            id="med-submit-btn"
          >
            <Plus size={14} />
            <span>Schedule Pill Reminder</span>
          </button>
        </form>
      </div>

      {/* Column 2: Medicine checklist */}
      <div className="lg:col-span-7 space-y-6" id="medications-checklist-panel">
        {/* Compliance details */}
        {totalCount > 0 && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4" id="meds-compliance-banner">
            <div className="flex items-center space-x-3 text-center sm:text-left">
              <div className="bg-red-50 p-2.5 rounded-xl text-[#DC2626]">
                <Smile size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm font-sans">Daily Medication Progress</h3>
                <p className="text-xs text-[#6B7280] font-bold">Compliance Rate: {complianceRate}% taken today</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button 
                onClick={onResetMedsDaily}
                className="bg-red-50 hover:bg-red-100 text-[#DC2626] font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 transition-all border border-red-100 cursor-pointer"
                id="reset-daily-meds-btn"
              >
                <RefreshCw size={12} />
                <span>Reset for New Day</span>
              </button>
            </div>
          </div>
        )}

        {/* Reminders schedule list */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4" id="medications-list-card">
          <h2 className="font-semibold text-base text-slate-800 font-sans">Daily Pill Scheduler</h2>

          {totalCount > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {meds.map((med) => (
                <div 
                  key={med.id} 
                  className={`p-4 rounded-xl border transition-all flex items-start justify-between ${
                    med.takenToday 
                      ? "bg-red-50/20 border-red-100 text-slate-400 line-through" 
                      : "bg-white border-slate-100 hover:border-red-100"
                  }`}
                  id={`med-row-${med.id}`}
                >
                  <div className="flex items-start space-x-3">
                    <button 
                      onClick={() => onToggleMed(med.id)}
                      className="mt-0.5 text-[#DC2626] hover:scale-105 transition-transform shrink-0 cursor-pointer"
                      id={`toggle-med-check-${med.id}`}
                    >
                      {med.takenToday ? <CheckCircle2 size={18} fill="currentColor" /> : <Circle size={18} />}
                    </button>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-800">{med.name}</p>
                      <p className="text-xs text-slate-400 font-bold">
                        Dosage: {med.dosage} • Frequency: {med.frequency}
                      </p>
                      <div className="flex items-center space-x-1.5 pt-1">
                        <Clock size={12} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400">{med.timeOfDay} Reminder</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteMed(med.id)}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                    id={`delete-med-btn-${med.id}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 space-y-3" id="no-meds-placeholder">
              <Calendar size={48} className="mx-auto text-slate-300" />
              <div className="space-y-1">
                <p className="font-bold text-slate-800 font-sans text-sm">No scheduled pill schedules</p>
                <p className="text-xs leading-relaxed max-w-xs mx-auto font-medium">
                  Add daily medicines, prescriptions, or vitamins into the scheduler to stay safe, healthy, and alert.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

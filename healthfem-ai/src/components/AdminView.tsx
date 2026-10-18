import React, { useState, useEffect } from "react";
import { 
  Users, 
  Hospital as HospitalIcon, 
  ClipboardList, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Search, 
  MapPin, 
  Phone, 
  Star, 
  Activity, 
  UserPlus, 
  Heart, 
  CheckCircle, 
  Info,
  Sliders,
  AlertCircle
} from "lucide-react";
import { UserAccount, Hospital, AdminLog } from "../types";

interface AdminViewProps {
  currentUser: UserAccount;
  theme: "light" | "dark";
}

export default function AdminView({ currentUser, theme }: AdminViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "users" | "hospitals" | "logs">("dashboard");
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [customHospitals, setCustomHospitals] = useState<Hospital[]>([]);
  
  // Search states
  const [userSearch, setUserSearch] = useState("");
  const [logSearch, setLogSearch] = useState("");
  
  // New User Form States
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"user" | "admin">("user");
  const [newUserAge, setNewUserAge] = useState("28");
  const [newUserGender, setNewUserGender] = useState("Female");
  
  // Hospital Form States
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [editingHospitalId, setEditingHospitalId] = useState<string | null>(null);
  const [hName, setHName] = useState("");
  const [hCity, setHCity] = useState("Ahmedabad");
  const [hAddress, setHAddress] = useState("");
  const [hPhone, setHPhone] = useState("");
  const [hRating, setHRating] = useState("4.5");
  const [hDistance, setHDistance] = useState("1.5");
  const [hSpecialties, setHSpecialties] = useState("");
  const [hHasEmergency, setHHasEmergency] = useState(true);
  const [hOpenStatus, setHOpenStatus] = useState("Open 24 Hours");

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const themeColors = {
    dark: {
      primary: "bg-white text-black hover:bg-slate-200",
      accentText: "text-white font-bold",
      accentBg: "bg-slate-900 text-slate-100 border border-slate-800",
      badge: "bg-slate-800 text-slate-300",
      border: "border-slate-800",
    },
    light: {
      primary: "bg-black text-white hover:bg-slate-800",
      accentText: "text-black font-bold",
      accentBg: "bg-slate-100 text-slate-900 border border-slate-200",
      badge: "bg-slate-200 text-slate-800",
      border: "border-slate-200",
    }
  };

  const colors = themeColors[theme] || themeColors.light;

  // Load resources from localStorage
  const loadData = () => {
    // 1. Users
    const savedUsers = localStorage.getItem("healthfem_users_list");
    let userList: UserAccount[] = [];
    if (savedUsers) {
      try { userList = JSON.parse(savedUsers); } catch(e) { userList = []; }
    }
    
    // Ensure primary admin account is updated to username "darshan" and password "darshan@194"
    let adminUser = userList.find(u => u.role === "admin" || u.id === "u-admin" || u.email === "darshan" || u.email === "admin@healthfem.ai");
    if (adminUser) {
      adminUser.email = "darshan";
      adminUser.name = "Darshan (Admin)";
      adminUser.password = "darshan@194";
      adminUser.role = "admin";
    } else {
      adminUser = { id: "u-admin", email: "darshan", name: "Darshan (Admin)", password: "darshan@194", role: "admin", createdAt: "18-Jul-2026", age: 26, gender: "Male" };
      userList.unshift(adminUser);
    }
    localStorage.setItem("healthfem_users_list", JSON.stringify(userList));
    setUsers(userList);

    // 2. Custom Hospitals
    const savedHosp = localStorage.getItem("healthfem_custom_hospitals");
    if (savedHosp) {
      setCustomHospitals(JSON.parse(savedHosp));
    } else {
      setCustomHospitals([]);
    }

    // 3. Admin logs
    const savedLogs = localStorage.getItem("healthfem_admin_logs");
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    } else {
      const initialLogs: AdminLog[] = [
        { id: "l-init-1", timestamp: new Date().toLocaleString(), type: "login", user: "system_daemon", details: "AuraHealth AI clinical diagnostic environment initiated." },
        { id: "l-init-2", timestamp: new Date().toLocaleString(), type: "login", user: "admin@aurahealth.ai", details: "Admin account session authorized successfully." }
      ];
      localStorage.setItem("healthfem_admin_logs", JSON.stringify(initialLogs));
      setLogs(initialLogs);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addLog = (type: "login" | "signup" | "symptom_triage" | "hospital_update" | "vitals_change" | "user_delete" | "user_update", user: string, details: string) => {
    const freshLogs = localStorage.getItem("healthfem_admin_logs") ? JSON.parse(localStorage.getItem("healthfem_admin_logs")!) : [];
    const newLog: AdminLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      type,
      user,
      details
    };
    const updated = [newLog, ...freshLogs];
    localStorage.setItem("healthfem_admin_logs", JSON.stringify(updated));
    setLogs(updated);
  };

  // --- Users Operations ---
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!newUserEmail || !newUserName || !newUserPassword) {
      setFormError("All fields are mandatory.");
      return;
    }

    const exists = users.some(u => u.email.toLowerCase() === newUserEmail.toLowerCase());
    if (exists) {
      setFormError("An account with this email already exists.");
      return;
    }

    const newUser: UserAccount = {
      id: `u-${Date.now()}`,
      email: newUserEmail.toLowerCase(),
      name: newUserName,
      password: newUserPassword,
      role: newUserRole,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      age: newUserAge ? parseInt(newUserAge) : 25,
      gender: newUserGender
    };

    const updated = [...users, newUser];
    localStorage.setItem("healthfem_users_list", JSON.stringify(updated));
    setUsers(updated);
    
    addLog("signup", currentUser.email, `Created new account for ${newUser.name} as ${newUser.role.toUpperCase()}.`);
    setFormSuccess("User account created successfully!");
    
    // reset form
    setNewUserEmail("");
    setNewUserName("");
    setNewUserPassword("");
    setNewUserAge("28");
    setTimeout(() => {
      setShowAddUserModal(false);
      setFormSuccess("");
    }, 1000);
  };

  const handleDeleteUser = (id: string, name: string, email: string) => {
    setFormError("");
    setFormSuccess("");
    if (id === currentUser.id || email === "darshan" || email === "admin@healthfem.ai" || id === "u-admin") {
      setFormError("Error: You cannot delete the primary active administrator account.");
      return;
    }

    const updated = users.filter(u => u.id !== id);
    localStorage.setItem("healthfem_users_list", JSON.stringify(updated));
    setUsers(updated);
    addLog("user_delete", currentUser.email, `Permanently deleted user account: ${name} (${email}).`);
    setFormSuccess(`User ${name} successfully removed.`);
  };

  const handleToggleUserRole = (id: string, name: string, currentRole: "user" | "admin") => {
    setFormError("");
    setFormSuccess("");
    if (id === currentUser.id) {
      setFormError("Error: You cannot demote yourself from administrator status.");
      return;
    }

    const nextRole = currentRole === "admin" ? "user" : "admin";
    const updated = users.map(u => {
      if (u.id === id) {
        return { ...u, role: nextRole };
      }
      return u;
    });

    localStorage.setItem("healthfem_users_list", JSON.stringify(updated));
    setUsers(updated);
    addLog("user_update", currentUser.email, `Modified user role of "${name}" to ${nextRole.toUpperCase()}.`);
  };

  // --- Hospitals Operations ---
  const handleSaveHospital = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!hName || !hAddress || !hPhone || !hSpecialties) {
      setFormError("All hospital attributes are required.");
      return;
    }

    const specialtiesArr = hSpecialties.split(",").map(s => s.trim()).filter(s => s.length > 0);

    if (editingHospitalId) {
      // Edit mode
      const updated = customHospitals.map(h => {
        if (h.id === editingHospitalId) {
          return {
            ...h,
            name: hName,
            city: hCity,
            address: hAddress,
            phone: hPhone,
            rating: parseFloat(hRating) || 4.5,
            distance: parseFloat(hDistance) || 1.5,
            specialties: specialtiesArr,
            hasEmergency: hHasEmergency,
            openStatus: hOpenStatus
          };
        }
        return h;
      });

      localStorage.setItem("healthfem_custom_hospitals", JSON.stringify(updated));
      setCustomHospitals(updated);
      addLog("hospital_update", currentUser.email, `Updated custom hospital entry: ${hName} in ${hCity}.`);
      setFormSuccess("Hospital details saved successfully!");
    } else {
      // Add mode
      const newHosp: Hospital = {
        id: `hosp-custom-${Date.now()}`,
        name: hName,
        city: hCity,
        address: hAddress,
        phone: hPhone,
        rating: parseFloat(hRating) || 4.5,
        distance: parseFloat(hDistance) || 1.5,
        specialties: specialtiesArr,
        hasEmergency: hHasEmergency,
        openStatus: hOpenStatus,
        latitude: hCity === "Ahmedabad" ? 23.0225 : hCity === "Surat" ? 21.1702 : 22.3072, // Mock coordinates
        longitude: hCity === "Ahmedabad" ? 72.5714 : hCity === "Surat" ? 72.8311 : 73.1812
      };

      const updated = [...customHospitals, newHosp];
      localStorage.setItem("healthfem_custom_hospitals", JSON.stringify(updated));
      setCustomHospitals(updated);
      addLog("hospital_update", currentUser.email, `Added a new specialty hospital: ${hName} in ${hCity}, Gujarat.`);
      setFormSuccess("New Gujarat hospital entry registered successfully!");
    }

    // Reset Form
    setHName("");
    setHAddress("");
    setHPhone("");
    setHSpecialties("");
    setEditingHospitalId(null);
    setTimeout(() => {
      setShowAddHospitalModal(false);
      setFormSuccess("");
    }, 1000);
  };

  const handleEditHospitalInit = (h: Hospital) => {
    setEditingHospitalId(h.id);
    setHName(h.name);
    setHCity(h.city);
    setHAddress(h.address);
    setHPhone(h.phone);
    setHRating(h.rating.toString());
    setHDistance(h.distance.toString());
    setHSpecialties(h.specialties.join(", "));
    setHHasEmergency(h.hasEmergency);
    setHOpenStatus(h.openStatus);
    setFormError("");
    setFormSuccess("");
    setShowAddHospitalModal(true);
  };

  const handleDeleteHospital = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete hospital entry: "${name}"?`)) {
      const updated = customHospitals.filter(h => h.id !== id);
      localStorage.setItem("healthfem_custom_hospitals", JSON.stringify(updated));
      setCustomHospitals(updated);
      addLog("hospital_update", currentUser.email, `Deleted custom hospital entry: ${name}.`);
    }
  };

  // Filter lists
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredLogs = logs.filter(l => 
    l.user.toLowerCase().includes(logSearch.toLowerCase()) || 
    l.details.toLowerCase().includes(logSearch.toLowerCase()) ||
    l.type.toLowerCase().includes(logSearch.toLowerCase())
  );

  return (
    <div className="space-y-6" id="admin-view-root">
      
      {/* Header Admin Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 via-orange-500/5 to-transparent p-6 rounded-3xl border border-blue-500/20 dark:border-blue-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="admin-header-banner">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="flex h-3.5 w-3.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-md">Administrator Control Center</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 font-sans">
            AuraHealth System Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Welcome, <strong>{currentUser.name}</strong>. Monitor diagnostic queries, optimize Gujarat emergency hospital maps, and manage user clinical records.
          </p>
        </div>
        
        {/* Quick Tabs Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/80 shrink-0 w-full md:w-auto" id="admin-tabs">
          <button
            onClick={() => setActiveSubTab("dashboard")}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "dashboard" 
                ? colors.primary + " shadow-xs" 
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveSubTab("users")}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "users" 
                ? colors.primary + " shadow-xs" 
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
            id="admin-users-tab-btn"
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveSubTab("hospitals")}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "hospitals" 
                ? colors.primary + " shadow-xs" 
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
            id="admin-hospitals-tab-btn"
          >
            Gujarat Hospitals ({customHospitals.length})
          </button>
          <button
            onClick={() => setActiveSubTab("logs")}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "logs" 
                ? colors.primary + " shadow-xs" 
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            Audits
          </button>
        </div>
      </div>

      {/* --- DASHBOARD TAB --- */}
      {activeSubTab === "dashboard" && (
        <div className="space-y-6 animate-fade-in" id="admin-dashboard">
          
          {/* Diagnostic KPI Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${colors.accentBg}`}>
                <Users size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Registered Patients</p>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{users.length}</h3>
                <p className="text-[9px] text-blue-500 font-bold flex items-center mt-0.5">
                  <CheckCircle size={10} className="mr-0.5" /> Synchronized locally
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
                <HospitalIcon size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Custom Hospitals</p>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{customHospitals.length} Added</h3>
                <p className="text-[9px] text-slate-500 font-semibold mt-0.5">Ahmedabad, Surat & other cities</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-900/40">
                <ClipboardList size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Triage Assessments</p>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {logs.filter(l => l.type === "symptom_triage").length + 4} Queries
                </h3>
                <p className="text-[9px] text-orange-500 font-bold mt-0.5">Powered by Gemini 3.5 AI</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-900/40">
                <Activity size={20} className="animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Core API Status</p>
                <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">99.98%</h3>
                <p className="text-[9px] text-slate-500 font-semibold mt-0.5">Latency: ~340ms (Healthy)</p>
              </div>
            </div>
          </div>

          {/* Graphical Analytics & Live Status Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Custom SVG Patient Analytics Graph */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Patient Triage Activity Trends</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Visual log count registered across recent hourly buckets</p>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md">Live Logs</span>
              </div>

              {/* Dynamic SVG Bar Chart */}
              <div className="pt-4 h-64 flex flex-col justify-between" id="analytics-svg-chart">
                <div className="flex items-end justify-between h-48 px-4 border-b border-slate-150 dark:border-slate-800 relative">
                  {/* Grid Lines */}
                  <div className="absolute left-0 right-0 top-1/4 border-t border-slate-100 dark:border-slate-900/50"></div>
                  <div className="absolute left-0 right-0 top-2/4 border-t border-slate-100 dark:border-slate-900/50"></div>
                  <div className="absolute left-0 right-0 top-3/4 border-t border-slate-100 dark:border-slate-900/50"></div>

                  {/* Bars */}
                  {[
                    { label: "08:00 AM", value: 30, count: 4 },
                    { label: "10:00 AM", value: 55, count: 7 },
                    { label: "12:00 PM", value: 45, count: 6 },
                    { label: "02:00 PM", value: 85, count: 11 },
                    { label: "04:00 PM", value: 70, count: 9 },
                    { label: "06:00 PM", value: 95, count: 13 },
                    { label: "08:00 PM", value: 40, count: 5 },
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center space-y-2 z-10 w-1/12 group relative">
                      {/* Tooltip on Hover */}
                      <div className="absolute -top-10 scale-0 group-hover:scale-100 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-md transition-all shadow-md shrink-0 whitespace-nowrap">
                        {item.count} Clinical Inquiries
                      </div>
                      
                      {/* Interactive Bar */}
                      <div 
                        className={`w-full rounded-t-lg transition-all duration-500 cursor-pointer ${
                          theme === "dark" 
                            ? "bg-white hover:bg-slate-200 shadow-slate-900" 
                            : "bg-black hover:bg-slate-800 shadow-slate-200"
                        }`}
                        style={{ height: `${item.value}%` }}
                      ></div>
                    </div>
                  ))}
                </div>

                {/* X Axis Labels */}
                <div className="flex justify-between px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>08:00 AM</span>
                  <span>10:00 AM</span>
                  <span>12:00 PM</span>
                  <span>02:00 PM</span>
                  <span>04:00 PM</span>
                  <span>06:00 PM</span>
                  <span>08:00 PM</span>
                </div>
              </div>
            </div>

            {/* System Directives & Audit Notice */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 lg:col-span-4 space-y-4">
              <div className="flex items-center space-x-1.5 text-orange-600 dark:text-orange-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                <AlertCircle size={16} />
                <h3 className="font-bold text-xs uppercase tracking-wider">System Safety Thresholds</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                As an AuraHealth AI administrator, you have permission to modify clinical diagnostic metrics, register hospital centers, and perform secure audit purges. 
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-2 text-xs">
                  <CheckCircle size={14} className="text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-200 block">Database Synchronization</span>
                    <span className="text-[11px] text-slate-400">All local patient storage is encrypted dynamically inside the workspace.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-xs">
                  <CheckCircle size={14} className="text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-200 block">Gujarat Geographic Grounding</span>
                    <span className="text-[11px] text-slate-400">Hospital suggestions prioritize Gujarat's cities including Ahmedabad and Surat.</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
                <strong>Admin Tip:</strong> Switch to the "Gujarat Hospitals" tab below to add more nearby clinical units in Ahmedabad, Rajkot, or Vadodara.
              </div>
            </div>

          </div>

          {/* Quick logs overview in dashboard */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Recent Triage & Security Incidents</h3>
              <button 
                onClick={() => setActiveSubTab("logs")}
                className={`text-[10px] font-bold uppercase hover:underline cursor-pointer ${colors.accentText}`}
              >
                View All Audits
              </button>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {logs.slice(0, 4).map((log) => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      log.type === "login" ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300" :
                      log.type === "signup" ? "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300" :
                      "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300"
                    }`}>
                      {log.type}
                    </span>
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{log.user}:</span>{" "}
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{log.details}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{log.timestamp.split(",")[1] || log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* --- USERS MANAGER TAB --- */}
      {activeSubTab === "users" && (
        <div className="space-y-6 animate-fade-in" id="admin-users-manager">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-3 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search registered patients..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-medium"
                id="user-search-input"
              />
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className={`${colors.primary} text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm`}
              id="admin-add-user-btn"
            >
              <UserPlus size={14} />
              <span>Create User Account</span>
            </button>
          </div>

          {/* User Add Form Drawer/Modal */}
          {showAddUserModal && (
            <div className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in" id="add-user-modal">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Register New Care Account</h3>
                <button 
                  onClick={() => setShowAddUserModal(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              {formError && <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 font-bold">{formError}</div>}
              {formSuccess && <div className="text-xs text-blue-600 bg-blue-50 p-2.5 rounded-lg border border-blue-100 font-bold">{formSuccess}</div>}

              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4" id="add-user-form">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Priyal Amin"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-medium"
                    id="admin-new-user-name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. name@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-medium"
                    id="admin-new-user-email"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-medium"
                    id="admin-new-user-password"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Age</label>
                  <input
                    type="number"
                    value={newUserAge}
                    onChange={(e) => setNewUserAge(e.target.value)}
                    className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gender</label>
                  <select
                    value={newUserGender}
                    onChange={(e) => setNewUserGender(e.target.value)}
                    className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-bold"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">System Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as "user" | "admin")}
                    className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-bold"
                  >
                    <option value="user">Patient (User)</option>
                    <option value="admin">Administrator (Admin)</option>
                  </select>
                </div>

                <div className="md:col-span-3 pt-2">
                  <button
                    type="submit"
                    className={`${colors.primary} text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer`}
                    id="admin-new-user-submit"
                  >
                    Confirm User Creation
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs" id="users-directory-table">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-150 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4">Age / Gender</th>
                  <th className="p-4">System Role</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-all">
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 font-mono">{user.email}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 font-medium">{user.createdAt}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      <span className="font-bold">{user.age || 25} yrs</span> • {user.gender || "Female"}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleUserRole(user.id, user.name, user.role)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider cursor-pointer ${
                          user.role === "admin" 
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300" 
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                        }`}
                        id={`role-btn-${user.id}`}
                      >
                        {user.role}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name, user.email)}
                        disabled={user.id === currentUser.id || user.email === "darshan" || user.id === "u-admin"}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer disabled:opacity-40"
                        id={`delete-user-${user.id}`}
                        title="Delete User"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* --- GUJARAT HOSPITALS MANAGER TAB --- */}
      {activeSubTab === "hospitals" && (
        <div className="space-y-6 animate-fade-in" id="admin-hospitals-manager">
          
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Gujarat Medical Directory Custom Entries</h3>
            
            <button
              onClick={() => {
                setEditingHospitalId(null);
                setHName("");
                setHAddress("");
                setHPhone("");
                setHSpecialties("");
                setFormError("");
                setFormSuccess("");
                setShowAddHospitalModal(true);
              }}
              className={`${colors.primary} text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm`}
              id="admin-add-hosp-btn"
            >
              <Plus size={14} />
              <span>Add Gujarat Hospital</span>
            </button>
          </div>

          {/* Hospital Form Drawer */}
          {showAddHospitalModal && (
            <div className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in" id="add-hospital-modal">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  {editingHospitalId ? "Edit Gujarat Hospital" : "Add New Gujarat Hospital Center"}
                </h3>
                <button 
                  onClick={() => setShowAddHospitalModal(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              {formError && <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 font-bold">{formError}</div>}
              {formSuccess && <div className="text-xs text-blue-600 bg-blue-50 p-2.5 rounded-lg border border-blue-100 font-bold">{formSuccess}</div>}

              <form onSubmit={handleSaveHospital} className="grid grid-cols-1 md:grid-cols-3 gap-4" id="hospital-entry-form">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hospital Name</label>
                  <input
                    type="text"
                    placeholder="e.g. H.CG. Cancer Centre"
                    value={hName}
                    onChange={(e) => setHName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-medium"
                    id="hosp-name-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gujarat City</label>
                  <select
                    value={hCity}
                    onChange={(e) => setHCity(e.target.value)}
                    className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-bold"
                    id="hosp-city-select"
                  >
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Surat">Surat</option>
                    <option value="Vadodara">Vadodara</option>
                    <option value="Rajkot">Rajkot</option>
                    <option value="Jamnagar">Jamnagar</option>
                    <option value="Bhavnagar">Bhavnagar</option>
                    <option value="Gandhinagar">Gandhinagar</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 79 1234 5678"
                    value={hPhone}
                    onChange={(e) => setHPhone(e.target.value)}
                    className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-medium"
                    id="hosp-phone-input"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Complete Address</label>
                  <input
                    type="text"
                    placeholder="Street address, S.G. Highway, Pincode"
                    value={hAddress}
                    onChange={(e) => setHAddress(e.target.value)}
                    className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-medium"
                    id="hosp-address-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Specialties (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="Cardiology, Pediatrics, Gynacology"
                    value={hSpecialties}
                    onChange={(e) => setHSpecialties(e.target.value)}
                    className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-medium"
                    id="hosp-specialties-input"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 md:col-span-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rating (1-5)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={hRating}
                      onChange={(e) => setHRating(e.target.value)}
                      className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Distance (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={hDistance}
                      onChange={(e) => setHDistance(e.target.value)}
                      className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Open Hours Status</label>
                    <input
                      type="text"
                      value={hOpenStatus}
                      onChange={(e) => setHOpenStatus(e.target.value)}
                      className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 md:col-span-3">
                  <input
                    type="checkbox"
                    checked={hHasEmergency}
                    onChange={(e) => setHHasEmergency(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    id="hosp-emergency-checkbox"
                  />
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer" htmlFor="hosp-emergency-checkbox">
                    This hospital has active 24/7 Trauma Care & Emergency Rooms
                  </label>
                </div>

                <div className="md:col-span-3 pt-2">
                  <button
                    type="submit"
                    className={`${colors.primary} text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer`}
                    id="hosp-save-submit"
                  >
                    {editingHospitalId ? "Save Changes" : "Register Gujarat Hospital"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Custom Hospitals list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="custom-hospitals-cards-grid">
            {customHospitals.length === 0 ? (
              <div className="col-span-2 text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
                <Info className="mx-auto text-slate-300 dark:text-slate-700 animate-pulse mb-3" size={32} />
                <p className="text-xs font-bold">No custom hospital entries found</p>
                <p className="text-[11px] leading-relaxed mt-1 max-w-sm mx-auto">
                  Click on "Add Gujarat Hospital" to register diagnostic centers in Vadodara, Ahmedabad, Rajkot, Surat, etc. Custom entries instantly blend with nearest searches.
                </p>
              </div>
            ) : (
              customHospitals.map((h) => (
                <div key={h.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 px-2 py-0.5 rounded">
                          {h.city} (GUJARAT)
                        </span>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{h.name}</h4>
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditHospitalInit(h)}
                          className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteHospital(h.id, h.name)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-400 hover:text-red-600 transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-start space-x-1.5">
                        <MapPin size={12} className="text-slate-400 mt-0.5 shrink-0" />
                        <span className="leading-snug">{h.address}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Phone size={12} className="text-slate-400 shrink-0" />
                        <span>{h.phone}</span>
                      </div>
                    </div>

                    {/* Specialties Badges */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {h.specialties.map((spec, i) => (
                        <span key={i} className="text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-orange-500 flex items-center">
                      <Star size={11} className="fill-orange-500 mr-0.5" />
                      {h.rating} / 5 Rating
                    </span>
                    <span className="text-slate-400 font-medium">
                      {h.distance} km away • {h.openStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* --- AUDIT LOGS TAB --- */}
      {activeSubTab === "logs" && (
        <div className="space-y-6 animate-fade-in" id="admin-security-audits">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Search Audits */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-3 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Filter logs by keyword..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-medium"
                id="audit-search-input"
              />
            </div>

            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to clear all log files?")) {
                  const emptyLogs = [
                    { id: "log-clear", timestamp: new Date().toLocaleString(), type: "login", user: currentUser.email, details: "Audit trail manual purge executed by admin." }
                  ];
                  localStorage.setItem("healthfem_admin_logs", JSON.stringify(emptyLogs));
                  setLogs(emptyLogs);
                }
              }}
              className="bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-xs font-bold px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/50 transition-all cursor-pointer"
            >
              Clear Log History
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs" id="audits-table-panel">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-150 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4 w-1/4">Timestamp</th>
                    <th className="p-4 w-1/6">Audit Event</th>
                    <th className="p-4 w-1/5">Operator</th>
                    <th className="p-4">Details / Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-all">
                      <td className="p-4 text-slate-400 font-mono font-bold">{log.timestamp}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          log.type === "login" ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300" :
                          log.type === "signup" ? "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300" :
                          log.type === "hospital_update" ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300" :
                          "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300"
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-200 font-semibold">{log.user}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 font-sans leading-relaxed">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

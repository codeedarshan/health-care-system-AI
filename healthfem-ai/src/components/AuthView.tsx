import React, { useState } from "react";
import { 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  UserCheck, 
  ShieldAlert, 
  Activity, 
  ArrowRight,
  UserPlus,
  Eye,
  EyeOff,
  Stethoscope,
  Heart
} from "lucide-react";
import { UserAccount } from "../types";

interface AuthViewProps {
  onLoginSuccess: (user: UserAccount) => void;
  theme: "light" | "dark";
}

export default function AuthView({ onLoginSuccess, theme }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Female");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const themeColors = {
    dark: {
      primary: "bg-[#DC2626] text-white hover:bg-[#B91C1C] focus:ring-[#DC2626]",
      accentText: "text-[#DC2626]",
      accentBg: "bg-[#122A4E] text-slate-100 border border-[#1E3F66]",
      gradient: "from-[#0A192F] via-[#102A4F] to-[#0A192F]",
      cardBorder: "border-[#122A4E]",
    },
    light: {
      primary: "bg-[#DC2626] text-white hover:bg-[#B91C1C] focus:ring-[#DC2626]",
      accentText: "text-[#DC2626]",
      accentBg: "bg-red-50 text-[#DC2626] border border-red-100",
      gradient: "from-[#FAFAFA] to-white",
      cardBorder: "border-slate-200",
    }
  };

  const colors = themeColors[theme] || themeColors.light;

  // Retrieve existing users or seed defaults
  const getUsers = (): UserAccount[] => {
    const saved = localStorage.getItem("healthfem_users_list");
    let usersList: UserAccount[] = [];
    if (saved) {
      try {
        usersList = JSON.parse(saved);
      } catch (e) {
        usersList = [];
      }
    }
    
    // Ensure the primary admin user exists with username "darshan" and password "darshan@194"
    let adminUser = usersList.find(u => u.role === "admin" || u.id === "u-admin" || u.email === "darshan" || u.email === "admin@healthfem.ai");
    if (adminUser) {
      adminUser.email = "darshan";
      adminUser.name = "Darshan (Admin)";
      adminUser.password = "darshan@194";
      adminUser.role = "admin";
    } else {
      adminUser = {
        id: "u-admin",
        email: "darshan",
        name: "Darshan (Admin)",
        password: "darshan@194",
        role: "admin",
        createdAt: new Date().toLocaleDateString(),
        age: 26,
        gender: "Male"
      };
      usersList.unshift(adminUser);
    }

    // Ensure sample patient account is present if list was empty
    if (!usersList.some(u => u.id === "u-patient-1" || u.email === "darshanjain1957@gmail.com")) {
      usersList.push({
        id: "u-patient-1",
        email: "darshanjain1957@gmail.com",
        name: "Darshan Jain",
        password: "user123",
        role: "user",
        createdAt: new Date().toLocaleDateString(),
        age: 26,
        gender: "Male"
      });
    }

    localStorage.setItem("healthfem_users_list", JSON.stringify(usersList));
    return usersList;
  };

  const logAdminAction = (type: string, user: string, details: string) => {
    const logs = localStorage.getItem("healthfem_admin_logs") ? JSON.parse(localStorage.getItem("healthfem_admin_logs")!) : [];
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      type,
      user,
      details
    };
    localStorage.setItem("healthfem_admin_logs", JSON.stringify([newLog, ...logs]));
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill in all credentials.");
      return;
    }

    const currentUsers = getUsers();

    if (isLogin) {
      // Login process - support email, username or name match
      const inputStr = email.trim().toLowerCase();
      const match = currentUsers.find(
        u => (u.email.toLowerCase() === inputStr || u.name.toLowerCase() === inputStr) && u.password === password.trim()
      );

      if (match) {
        setSuccess(`Welcome back, ${match.name}! Logging you in...`);
        logAdminAction("login", match.email, `${match.name} successfully logged into the system.`);
        setTimeout(() => {
          onLoginSuccess(match);
        }, 800);
      } else {
        setError("Invalid username/email or password combination.");
      }
    } else {
      // Signup process
      if (!name) {
        setError("Please enter your name.");
        return;
      }

      const exists = currentUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (exists) {
        setError("This username/email is already registered.");
        return;
      }

      const newUser: UserAccount = {
        id: `u-${Date.now()}`,
        email: email.trim().toLowerCase(),
        name,
        password: password.trim(),
        role: "user",
        createdAt: new Date().toLocaleDateString(),
        age: age ? parseInt(age) : 25,
        gender: gender
      };

      const updated = [...currentUsers, newUser];
      localStorage.setItem("healthfem_users_list", JSON.stringify(updated));
      
      // Update profile in local storage to match newly signed up user
      const updatedProfile = {
        name: newUser.name,
        age: newUser.age || 25,
        gender: newUser.gender || "Female",
        height: 165,
        weight: 60,
        bloodType: "B+",
        medicalConditions: [],
        allergies: [],
        healthGoals: "fitness",
        activityLevel: "moderate",
        dietaryPreference: "none"
      };
      localStorage.setItem("health_sathi_profile", JSON.stringify(updatedProfile));

      logAdminAction("signup", newUser.email, `New patient account created: ${newUser.name} (Age: ${newUser.age}, Gender: ${newUser.gender}).`);
      setSuccess("Account registered successfully! Welcome aboard.");
      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 1000);
    }
  };

  // Immediate access testing triggers
  const handleQuickAccess = (isAdmin: boolean) => {
    const users = getUsers();
    const emailToUse = isAdmin ? "darshan" : "darshanjain1957@gmail.com";
    const passToUse = isAdmin ? "darshan@194" : "user123";
    
    setEmail(emailToUse);
    setPassword(passToUse);
    setIsLogin(true);
    
    const match = users.find(u => u.email === emailToUse || (isAdmin && u.role === "admin"));
    if (match) {
      setSuccess(`Quick Access: Logging in as ${match.role.toUpperCase()} (${match.name})...`);
      logAdminAction("login", match.email, `Quick Access: ${match.name} entered as ${match.role}.`);
      setTimeout(() => {
        onLoginSuccess(match);
      }, 800);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4 md:p-8" id="auth-view-container">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12" id="auth-panel-grid">
        
        {/* Left Interactive Greeting and Benefits Pitch */}
        <div className={`lg:col-span-5 bg-gradient-to-br ${colors.gradient} p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800/80`} id="auth-left-banner">
          <div className="space-y-6">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#DC2626] text-white font-bold shadow-md">
                <Heart size={20} className="fill-white" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
                  Aura<span className="text-[#DC2626]">Health AI</span>
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Your Personal Clinical Triage & AI Coach</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-2xl font-bold leading-tight text-slate-800 dark:text-slate-100">
                A highly refined personal care & clinical triage companion.
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Unlock a personalized healthcare assistant tailored specifically to your active physiological indicators, wellness coaching, and clinical guidance.
              </p>
            </div>

            {/* Feature Highlights List */}
            <div className="space-y-3 pt-4">
              <div className="flex items-start space-x-2.5 text-xs">
                <span className={`p-1 rounded-lg ${colors.accentBg} shrink-0`}>
                  <Stethoscope size={14} />
                </span>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Symptom Assessor & Triage</h4>
                  <p className="text-[11px] text-slate-500">Analyze symptoms and obtain immediate severity recommendations.</p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 text-xs">
                <span className={`p-1 rounded-lg ${colors.accentBg} shrink-0`}>
                  <Sparkles size={14} />
                </span>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Ayurvedic Diet Planner</h4>
                  <p className="text-[11px] text-slate-500">Generate high-contrast nutritional guidelines and schedules.</p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 text-xs">
                <span className={`p-1 rounded-lg ${colors.accentBg} shrink-0`}>
                  <Activity size={14} />
                </span>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Hospital Finder (Gujarat & India)</h4>
                  <p className="text-[11px] text-slate-500">Find real specialty healthcare centers and get routing advice.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Active Form Area */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center" id="auth-form-card">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 font-sans">
                {isLogin ? "Sign in to AuraHealth AI" : "Create your Care Account"}
              </h2>
              <p className="text-xs text-slate-400 font-bold">
                {isLogin 
                  ? "Enter your registered username or email below to log in" 
                  : "Fill out the fields below to open a free digital wellness companion account"}
              </p>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-pulse" id="auth-error-banner">
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 rounded-xl text-xs font-semibold flex items-center space-x-2" id="auth-success-banner">
                <UserCheck size={16} />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4" id="main-auth-form">
              {!isLogin && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="e.g. Pooja Patel"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-medium"
                      id="signup-name-input"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Username or Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="e.g. darshan or name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-medium"
                    id="auth-email-input"
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Age</label>
                    <input
                      type="number"
                      placeholder="28"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-medium"
                      id="signup-age-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gender Identity</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-bold"
                      id="signup-gender-select"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account Password</label>
                  {isLogin && (
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                      Forgot Password?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-10 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-medium"
                    id="auth-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    id="toggle-pass-visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full text-white font-bold py-3 px-4 rounded-xl transition-all text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-md cursor-pointer ${colors.primary} mt-6`}
                id="auth-submit-btn"
              >
                <span>{isLogin ? "Sign In to Portal" : "Complete Registration"}</span>
                <ArrowRight size={14} />
              </button>
            </form>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isLogin ? "New to AuraHealth AI?" : "Already have an account?"}{" "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                    setSuccess("");
                  }}
                  className={`font-bold hover:underline transition-all cursor-pointer ${colors.accentText}`}
                  id="auth-mode-switch"
                >
                  {isLogin ? "Create an account" : "Sign In instead"}
                </button>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

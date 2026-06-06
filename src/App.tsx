import React, { useState, useEffect } from "react";
import { 
  StateResponse, 
  WearableBrand, 
  MLModelType, 
  HealthMetrics, 
  UserProfile 
} from "./types";
import DigitalTwin from "./components/DigitalTwin";
import RiskSimulator from "./components/RiskSimulator";
import { SleepModule, StressBreathingModule, FitnessModule } from "./components/WellnessSuites";
import CommandHub from "./components/CommandHub";
import HealthAssistant from "./components/HealthAssistant";

import { 
  Activity, 
  ShieldAlert, 
  Smartphone, 
  User, 
  Moon, 
  Sun, 
  LogOut, 
  Lock, 
  TrendingUp, 
  Heart, 
  Gauge, 
  Thermometer, 
  Eye, 
  Clock,
  Sparkles,
  RefreshCw,
  PlusCircle,
  Stethoscope,
  AlertTriangle
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export default function App() {
  const [session, setSession] = useState<StateResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [darkMode, setDarkMode] = useState(true);

  // Sign in prefilled values
  const [email, setEmail] = useState("alex.mercer@medtech.io");
  const [name, setName] = useState("Alex Mercer");
  const [age, setAge] = useState(38);
  const [weight, setWeight] = useState(81);
  const [height, setHeight] = useState(178);

  // Time-series Forecasting Tab State
  const [forecastDays, setForecastDays] = useState(30);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [forecastLoading, setForecastLoading] = useState(false);

  // Main UI bays
  const [activeBay, setActiveBay] = useState<"dashboard" | "twin" | "risks" | "forecast" | "control" | "chat">("dashboard");

  // Dynamic system clock
  const [currentTime, setCurrentTime] = useState(new Date().toISOString());

  // Quick ECG Waveform generation for aesthetic display
  const [ecgPoints, setEcgPoints] = useState<number[]>([10, 10, 10, 10, 30, -5, 45, -15, 12, 10, 10, 10]);

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Poll state from the backend every 4 seconds to sync live vital changes & anomalies
  useEffect(() => {
    if (isAuthenticated) {
      const fetchState = async () => {
        try {
          const res = await fetch("/api/state");
          const data = await res.json();
          setSession(data);
        } catch (err) {
          console.error("Homeostatic sync failed", err);
        }
      };

      fetchState();
      const interval = setInterval(fetchState, 4000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Sync live heart beats ECG graph animation
  useEffect(() => {
    if (isAuthenticated) {
      const ecgInterval = setInterval(() => {
        setEcgPoints(prev => {
          // Circular queue rotation simulating heart contraction waves
          const [first, ...rest] = prev;
          return [...rest, first];
        });
      }, 150);
      return () => clearInterval(ecgInterval);
    }
  }, [isAuthenticated]);

  // Fetch forecast telemetry when requested
  useEffect(() => {
    if (isAuthenticated && activeBay === "forecast") {
      const fetchForecast = async () => {
        setForecastLoading(true);
        try {
          const res = await fetch(`/api/forecast?days=${forecastDays}`);
          const data = await res.json();
          setForecastData(data);
        } catch (err) {
          console.error("Forecast metrics fetch failed", err);
        } finally {
          setForecastLoading(false);
        }
      };
      fetchForecast();
    }
  }, [isAuthenticated, activeBay, forecastDays]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
    // Request starting state fromExpress gateway
    try {
      const res = await fetch("/api/state");
      const data = await res.json();
      setSession(data);
    } catch (err) {
      console.error("Initial load failed", err);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
    // Transmit register profile state to server
    try {
      const res = await fetch("/api/state/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            name,
            email,
            age: Number(age),
            weight: Number(weight),
            height: Number(height),
            familyHistory: { cardiovascular: true, diabetes: false, hypertension: true }
          }
        })
      });
      const data = await res.json();
      setSession(data);
    } catch (err) {
      console.error("Signup dispatch failed", err);
    }
  };

  const syncStatePayload = async (payload: any) => {
    try {
      const res = await fetch("/api/state/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setSession(data);
    } catch (err) {
      console.error("Failed to update server state coordinates", err);
    }
  };

  const handleModelChange = (model: MLModelType) => {
    syncStatePayload({ simConfig: { ...session?.simConfig, activeModel: model } });
  };

  const handleLifestyleFactorsChange = (factors: { saltIntake: number; fitnessHours: number; alcoholUsage: number }) => {
    syncStatePayload({ factors });
  };

  const handleSignout = () => {
    setIsAuthenticated(false);
    setSession(null);
  };

  // Auth gate check
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-neutral-50 text-slate-900"} font-sans`}>
        {/* Abstract futuristic biological grid backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950/10 to-transparent pointer-events-none" />

        <div className={`max-w-md w-full border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-zinc-200 shadow-xl"} rounded-2xl overflow-hidden p-8 z-10 transition-all duration-300 relative`}>
          {/* Logo Heading badge */}
          <div className="flex flex-col items-center text-center mb-6">
            <span className="p-3 bg-emerald-950 border border-emerald-800 rounded-2xl text-emerald-400 mb-3.5 flex justify-center glow-emerald">
              <Stethoscope className="w-8 h-8 clinical-heart-pulse" />
            </span>
            <h1 className="text-xl font-bold tracking-tight">HealthGuard AI</h1>
            <p className="text-xs text-slate-400 font-sans mt-1">Clinical Diagnostics & Predictive Health Twin</p>
          </div>

          <div className="flex border-b border-slate-800 pb-2 mb-6 gap-4">
            <button
              onClick={() => setAuthMode("login")}
              className={`text-slate-300 text-xs font-mono pb-2 transition cursor-pointer border-b-2 ${authMode === "login" ? "border-emerald-500 font-bold" : "border-transparent"}`}
            >
              PHYSICIAN SIGN IN
            </button>
            <button
              onClick={() => setAuthMode("signup")}
              className={`text-slate-300 text-xs font-mono pb-2 transition cursor-pointer border-b-2 ${authMode === "signup" ? "border-emerald-500 font-bold" : "border-transparent"}`}
            >
              REGISTER DIGITAL TWIN PROFILE
            </button>
          </div>

          {authMode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Authorized Credential (Email)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs font-mono mt-1.5 p-3 bg-slate-950/80 border border-slate-850 rounded-lg text-white focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Security Password Token</label>
                <input
                  type="password"
                  defaultValue="hi-paa-compliant-1"
                  className="w-full text-xs mt-1.5 p-3 bg-slate-950/80 border border-slate-850 rounded-lg text-white focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-md mt-6 cursor-pointer text-center"
              >
                ACCESS MEDICAL DASHBOARD
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block lowercase">User full name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs font-sans mt-1 p-2 bg-slate-950/80 border border-slate-850 rounded text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block lowercase">Email account</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs font-sans mt-1 p-2 bg-slate-950/80 border border-slate-850 rounded text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block lowercase">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full text-xs font-mono mt-1 p-2 bg-slate-950/80 border border-slate-850 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block lowercase">Weight (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full text-xs font-mono mt-1 p-2 bg-slate-950/80 border border-slate-850 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block lowercase">Height (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full text-xs font-mono mt-1 p-2 bg-slate-950/80 border border-slate-850 rounded text-white"
                  />
                </div>
              </div>

              <div className="text-[10px] font-sans text-slate-400 bg-slate-950/40 border border-slate-850/60 p-2.5 rounded-md leading-normal mt-3">
                * Note: Registering automatically binds a cardiovascular risk predisposition family history metric vector inside our decision forest classifier to replicate early heart conditions diagnostics.
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg transition mt-4 cursor-pointer text-center"
              >
                INITIALIZE HOMEOSTATIC MODEL
              </button>
            </form>
          )}

          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-5 pt-3 border-t border-slate-800">
            <span className="flex items-center gap-1"><Lock className="w-3" /> HIPAA E_PHI PROTECTION</span>
            <span>v2.5.0-Secure</span>
          </div>
        </div>
      </div>
    );
  }

  // Loading phase while session fetches
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100 font-mono">
        <div className="text-center space-y-4">
          <RefreshCw className="w-10 h-10 animate-spin text-emerald-400 mx-auto" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-300">Synchronizing HealthGuard Core telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`} id="health-dashboard-wrapper">
      {/* 1. Global Navigation Headways and Telemetry banner */}
      <header className={`border-b ${darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-zinc-200 shadow-sm"} backdrop-blur p-4 px-6 flex justify-between items-center sticky top-0 z-40`}>
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-400 flex items-center shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <Stethoscope className="w-5 h-5 clinical-heart-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white uppercase sm:text-base">HealthGuard AI</h1>
              <span className="text-[8px] sm:text-[9px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-1.5 py-0.5 rounded leading-none uppercase tracking-widest">
                Startup Grade
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5 hidden sm:block">Intelligent Diagnostic & Biometric forecast Platform</p>
          </div>
        </div>

        {/* Dynamic Vitals Decoupling, Battery status, Mode, and signout indicators */}
        <div className="flex items-center gap-4">
          {/* UTC Clock banner */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Time: {currentTime.split('T')[1].slice(0, 8)} UTC</span>
          </div>

          {/* Active watch brand indicator */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-2.5 py-1.5 rounded-lg text-[10px] font-mono">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">{session.wearable.brand}</span>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/50 px-1 py-0.5 rounded-md text-[8px] font-bold">
              {session.wearable.battery}% Battery
            </span>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 bg-slate-950/60 border rounded-lg transition cursor-pointer text-slate-400 hover:text-white ${darkMode ? "border-slate-800" : "border-zinc-200"}`}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          <button
            onClick={handleSignout}
            className="p-2 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/60 rounded-lg text-rose-400 transition cursor-pointer"
            title="Log Out Security Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Critical telemetry warning alarms (Isolation Forest notifications) */}
      {session.anomalies.length > 0 && (
        <div className="bg-rose-950 border-y border-rose-800 text-rose-200 text-xs p-3 px-6 flex justify-between items-center animate-pulse z-30 relative shadow-lg">
          <div className="flex gap-2.5 items-center">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <p className="font-sans leading-none tracking-wide sm:text-xs text-[11px]">
              <b>[CRITICAL BIOMETRIC SIREN]</b> {session.anomalies[0].severity === "critical" ? "Severe" : "Mild"} anomaly detected in {session.anomalies[0].metric} stream. Current level reaches <b>{session.anomalies[0].value}</b>. Emergency contact notified.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold bg-rose-900 px-2.5 py-0.5 rounded-full border border-rose-700 max-sm:hidden">
            Active Warning System
          </span>
        </div>
      )}

      {/* 3. Primary bays routing structure */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Dynamic Vitals Indicators Header Cards section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4" id="vitals-telemetry-strip">
          
          {/* Card 1: Cardiac (Heart Rate) */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
            session.metrics.heartRate > 110 || session.metrics.heartRate < 45
              ? "bg-rose-950/20 border-rose-500/40 shadow-[0_0_20px_rgba(239,68,68,0.08)]"
              : darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-zinc-200 shadow-sm"
          }`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Pulse Rate</span>
              <Heart className={`w-4 h-4 text-rose-500 ${session.metrics.heartRate > 90 ? "clinical-heart-pulse text-rose-400" : ""}`} />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono leading-none">{session.metrics.heartRate}</p>
              <span className="text-[10px] font-mono text-slate-500">BPM</span>
            </div>
            
            {/* Real aesthetic cardiac contraction wave graph */}
            <div className="w-full h-8 flex gap-0.5 items-end mt-4 opacity-50 relative">
              <svg viewBox="0 0 100 20" className="w-full h-full text-rose-500 stroke-current fill-none">
                <polyline
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={ecgPoints.map((pt, idx) => `${idx * 9},${10 + (pt - 10) * 0.4}`).join(" ")}
                />
              </svg>
            </div>
          </div>

          {/* Card 2: Blood Oxygen (SpO2) */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
            session.metrics.spo2 < 93
              ? "bg-rose-950/20 border-rose-500/40 shadow-[0_0_20px_rgba(239,68,68,0.08)]"
              : darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-zinc-200 shadow-sm"
          }`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Gaseous Oxygen</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono leading-none">{session.metrics.spo2}%</p>
              <span className="text-[10px] font-mono text-slate-400">SpO2</span>
            </div>

            <div className="space-y-1.5 mt-4">
              <div className="w-full bg-slate-950 rounded-full h-1">
                <div className="h-1 bg-cyan-400 rounded-full" style={{ width: `${session.metrics.spo2}%` }} />
              </div>
              <span className="text-[9px] font-mono text-slate-500 block">Baseline safety threshold: &gt;94%</span>
            </div>
          </div>

          {/* Card 3: Arterial Blood Pressure */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 ${
            session.metrics.systolicBP > 135
              ? "bg-amber-950/20 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.08)]"
              : darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-zinc-200 shadow-sm"
          }`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Systolic Tension</span>
              <Gauge className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono leading-none">
                {session.metrics.systolicBP}<span className="text-slate-400 font-sans font-medium text-lg">/</span>{session.metrics.diastolicBP}
              </p>
              <span className="text-[9px] font-mono text-slate-400">mmHg</span>
            </div>
            
            <span className={`text-[9px] font-semibold mt-4 block py-0.5 rounded px-2 w-max ${
              session.metrics.systolicBP > 135 
                ? "bg-amber-950 text-amber-300 border border-amber-900/50" 
                : "bg-emerald-950 text-emerald-300 border border-emerald-950"
            }`}>
              {session.metrics.systolicBP > 135 ? "Stage-1 Tension Warning" : "Ideal Vascular Compliance"}
            </span>
          </div>

          {/* Card 4: Neural HRV / Active Stress */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 ${
            session.metrics.stressLevel > 75
              ? "bg-rose-950/20 border-rose-500/40 shadow-[0_0_20px_rgba(239,68,68,0.08)]"
              : darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-zinc-200 shadow-sm"
          }`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Autonomic Stress</span>
              <Thermometer className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono leading-none">{session.metrics.stressLevel}</p>
              <span className="text-[9px] font-mono text-slate-400">/100 Index</span>
            </div>

            <div className="flex justify-between items-center mt-4 text-[10px] font-mono text-slate-500">
              <span>Cardio HRV: <b className="text-indigo-400 font-mono">{session.metrics.hrv}ms</b></span>
              <span>Temp: <b>{session.metrics.bodyTemp}°C</b></span>
            </div>
          </div>

        </section>

        {/* Global tab controllers to select Bay interfaces */}
        <section className="flex bg-slate-900 border border-slate-800 rounded-xl p-1.5 gap-2 overflow-x-auto select-none font-mono text-xs">
          <button
            onClick={() => setActiveBay("dashboard")}
            className={`flex-1 py-3 px-4 rounded-lg text-center font-semibold transition cursor-pointer whitespace-nowrap ${activeBay === "dashboard" ? "bg-emerald-650 text-white shadow-md font-bold" : "text-slate-400 hover:text-white"}`}
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => setActiveBay("twin")}
            className={`flex-1 py-3 px-4 rounded-lg text-center font-semibold transition cursor-pointer whitespace-nowrap ${activeBay === "twin" ? "bg-emerald-650 text-white shadow-md font-bold" : "text-slate-400 hover:text-white"}`}
          >
            Digital Twin Pro
          </button>
          <button
            onClick={() => setActiveBay("risks")}
            className={`flex-1 py-3 px-4 rounded-lg text-center font-semibold transition cursor-pointer whitespace-nowrap ${activeBay === "risks" ? "bg-emerald-650 text-white shadow-md font-bold" : "text-slate-400 hover:text-white"}`}
          >
            Risk Predictors & XAI
          </button>
          <button
            onClick={() => setActiveBay("forecast")}
            className={`flex-1 py-3 px-4 rounded-lg text-center font-semibold transition cursor-pointer whitespace-nowrap ${activeBay === "forecast" ? "bg-emerald-650 text-white shadow-md font-bold" : "text-slate-400 hover:text-white"}`}
          >
            30-90D Forecasting
          </button>
          <button
            onClick={() => setActiveBay("control")}
            className={`flex-1 py-3 px-4 rounded-lg text-center font-semibold transition cursor-pointer whitespace-nowrap ${activeBay === "control" ? "bg-emerald-650 text-white shadow-md font-bold" : "text-slate-400 hover:text-white"}`}
          >
            Command Control Hub
          </button>
          <button
            onClick={() => setActiveBay("chat")}
            className={`flex-1 py-3 px-4 rounded-lg text-center font-semibold transition cursor-pointer whitespace-nowrap ${activeBay === "chat" ? "bg-emerald-650 text-white shadow-md font-bold" : "text-slate-400 hover:text-white"}`}
          >
            Conversational AI
          </button>
        </section>

        {/* --- DYNAMIC BAY VIEWS --- */}

        {/* BAY 1: General Dashboard submenus */}
        {activeBay === "dashboard" && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" id="dashboard-bays-panel">
            {/* Dynamic Cardiorespiratory exercises checklists and physical achievements */}
            <FitnessModule metrics={session.metrics} habits={session.habits} onUpdateState={syncStatePayload} />

            {/* Glowing countdown diaphragmatic respiration circle trigger */}
            <StressBreathingModule metrics={session.metrics} onUpdateState={syncStatePayload} />

            {/* Sleep cycles analytics */}
            <SleepModule metrics={session.metrics} />
          </section>
        )}

        {/* BAY 2: Interactive SVG Digital Twin */}
        {activeBay === "twin" && (
          <section className="animate-fade-in">
            <DigitalTwin metrics={session.metrics} />
          </section>
        )}

        {/* BAY 3: Risk Prediction Simulators and comparative XGBoost evaluation sets */}
        {activeBay === "risks" && (
          <section className="animate-fade-in">
            <RiskSimulator
              risks={session.risks}
              modelsPerformance={session.modelsPerformance}
              activeModel={session.simConfig.activeModel}
              onFactorsChange={handleLifestyleFactorsChange}
              onModelToggle={handleModelChange}
            />
          </section>
        )}

        {/* BAY 4: 30-90 Day Time Series Forecasting (Advanced recurrent forecasting charts) */}
        {activeBay === "forecast" && (
          <section className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-6 animate-fade-in" id="forecasting-viewport">
            <div className="flex justify-between items-center flex-wrap gap-4 pb-4 border-b border-slate-800">
              <div className="flex gap-2.5 items-center">
                <span className="p-1.5 bg-indigo-950 text-indigo-400 border border-indigo-900 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-white text-sm font-semibold uppercase tracking-wider">30–90 Day AI Bio-Force Forecasting</h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">Predictive adaptations modeling representing LSTM time-series forecast sets.</p>
                </div>
              </div>

              {/* Day selection slider options */}
              <div className="flex gap-2 font-mono text-xs">
                {[30, 60, 90].map((d) => (
                  <button
                    key={d}
                    onClick={() => setForecastDays(d)}
                    className={`py-1.5 px-3 rounded-lg transition border cursor-pointer ${
                      forecastDays === d
                        ? "bg-emerald-950 text-emerald-400 border-emerald-500/50"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {d} Days Trend
                  </button>
                ))}
              </div>
            </div>

            {forecastLoading ? (
              <div className="h-80 flex items-center justify-center font-mono text-xs text-slate-400 animate-pulse">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mr-2" /> Recalculating future homeostatic predictions...
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-3">Predicted Future Cardiac Rhythm and Neural Sleep Adaptations Curve</p>
                  <div className="h-72 bg-slate-900/40 rounded-xl p-4 border border-slate-800/60 shadow-inner">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={forecastData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="day" stroke="#475569" fontSize={9} />
                        <YAxis stroke="#475569" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b" }} />
                        <Legend wrapperStyle={{ fontSize: "10px", fontFamily: "monospace" }} />
                        <Line type="monotone" dataKey="predictedHeartRate" stroke="#f43f5e" name="Predicted Heart Rate (BPM)" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="predictedSleepQuality" stroke="#818cf8" name="Predicted Sleep Quality Index" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="predictedStressLevel" stroke="#fbbf24" name="Predicted Autonomic Stress Level" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-slate-300 font-sans space-y-2 leading-relaxed">
                  <span className="font-semibold text-white block text-sm mb-1">💡 Forensic Forecast Interpretation</span>
                  <p>• Model trends indicate that keeping physical exercise values high will suppress stress factors by up to 22% in the consecutive {forecastDays} days.</p>
                  <p>• Circadian rest intervals are forecast to reach an efficiency ceiling of <b className="text-emerald-400">92%</b>, enhancing your vagal heart rate variability parameters dynamically.</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* BAY 5: Family shared viewports, reports compilations, alerts adjustments, and encryption logs */}
        {activeBay === "control" && (
          <section className="animate-fade-in">
            <CommandHub
              family={session.family}
              anomalies={session.anomalies}
              auditLogs={session.auditLogs}
              wearable={session.wearable}
              simConfig={session.simConfig}
              metrics={session.metrics}
              onUpdateState={syncStatePayload}
            />
          </section>
        )}

        {/* BAY 6: Full context active clinician chat assistant */}
        {activeBay === "chat" && (
          <section className="animate-fade-in">
            <HealthAssistant metrics={session.metrics} risks={session.risks} />
          </section>
        )}

      </main>

      {/* 4. Global Swiss Footer details */}
      <footer className="max-w-7xl mx-auto mt-12 p-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-mono text-slate-500 bg-slate-950 relative z-10 select-none">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span>HealthGuard AI Platform Node ID: <b className="text-zinc-400 font-mono">CN_RUN_01</b></span>
            <span className="text-slate-700">•</span>
            <span>Security Cryptonomy: <b className="text-emerald-400 font-mono">HIPAA Compliant</b></span>
          </div>
          <p className="text-slate-550 text-[9px] font-sans">© 2026 HealthGuard AI. Deployed Under Cloud Run Sandbox Ingress.</p>
        </div>

        {/* Enthusiastic Made By Corner Block */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-indigo-950/30 to-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3 shadow-lg max-w-sm w-full text-left">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-indigo-950 border border-indigo-500/50 flex items-center justify-center text-xs font-bold text-white font-mono shadow-[0_0_10px_rgba(99,102,241,0.25)] relative overflow-hidden shrink-0">
              JK
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent pointer-events-none" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest bg-indigo-950 border border-indigo-900/60 px-1 py-0.5 rounded">Lead Architect</span>
              <span className="text-[8px] font-mono text-emerald-400 font-semibold uppercase">Systems Core</span>
            </div>
            <p className="text-xs font-bold text-white font-sans mt-0.5">Jyoti Kumar</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5 select-all selection:bg-indigo-900 selection:text-indigo-300">
              jknewcar25@gmail.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

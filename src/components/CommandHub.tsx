import React, { useState } from "react";
import { 
  FamilyProfile, 
  AnomalyReport, 
  HIPAAAuditLog, 
  WearableBrand, 
  SimConfig, 
  HealthMetrics,
  MLModelType
} from "../types";
import { 
  Users, 
  ShieldAlert, 
  ShieldCheck,
  Cpu, 
  FileDown, 
  Smartphone, 
  Heart, 
  AlertCircle, 
  Activity, 
  Clock,
  Settings,
  Bot,
  Sparkles,
  Download,
  AlertTriangle
} from "lucide-react";

interface CommandHubProps {
  family: FamilyProfile[];
  anomalies: AnomalyReport[];
  auditLogs: HIPAAAuditLog[];
  wearable: {
    connected: boolean;
    brand: WearableBrand;
    battery: number;
    syncTime: string;
  };
  simConfig: SimConfig;
  onUpdateState: (payload: any) => void;
  metrics: HealthMetrics;
}

export default function CommandHub({
  family,
  anomalies,
  auditLogs,
  wearable,
  simConfig,
  onUpdateState,
  metrics
}: CommandHubProps) {
  const [activeTab, setActiveTab] = useState<"family" | "emergency" | "admin" | "report">("family");

  // Emergency contact configurator state
  const [guardianName, setGuardianName] = useState("Eleanor Mercer");
  const [guardianPhone, setGuardianPhone] = useState("+1-415-555-8931");
  const [dispatchLogs, setDispatchLogs] = useState<string | null>(null);
  const [sosLoading, setSosLoading] = useState(false);

  // Advanced sensor adjusters
  const [forcedHRMultiplier, setForcedHRMultiplier] = useState(1.0);
  const [forcedSpO2Multiplier, setForcedSpO2Multiplier] = useState(1.0);
  const [forcedStressMultiplier, setForcedStressMultiplier] = useState(1.0);

  // Report Generator Timeline state
  const [reportTimeline, setReportTimeline] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [reportText, setReportText] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [csvContent, setCsvContent] = useState<string | null>(null);

  // Trigger simulated medical emergency dispatch
  const handleSOSTrigger = async () => {
    setSosLoading(true);
    try {
      const response = await fetch("/api/emergency/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: guardianName,
          contactPhone: guardianPhone,
          reason: `Vitals alarm threshold cross. Active metrics standard: Heart Rate ${metrics.heartRate} BPM, SpO2 ${metrics.spo2}%.`
        })
      });
      const data = await response.json();
      if (data.success) {
        setDispatchLogs(data.dispatchLog);
        // Refresh full state
        const stateRes = await fetch("/api/state");
        const stateData = await stateRes.json();
        onUpdateState(stateData);
      }
    } catch (err) {
      console.error("SOS Dispatch failed", err);
      setDispatchLogs("[GATEWAY_ERROR] Unable to contact cellular gateway. Backup analog telemetry trigger initialized.");
    } finally {
      setSosLoading(false);
    }
  };

  // Adjust in-memory sensor simulation values
  const applySensorTweak = (hrMult: number, spo2Mult: number, stressMult: number) => {
    setForcedHRMultiplier(hrMult);
    setForcedSpO2Multiplier(spo2Mult);
    setForcedStressMultiplier(stressMult);

    const isAnomaly = hrMult !== 1.0 || spo2Mult !== 1.0 || stressMult !== 1.0;

    onUpdateState({
      simConfig: {
        ...simConfig,
        anomaliesEnabled: isAnomaly,
        heartRateAnomalyRatio: hrMult,
        spo2AnomalyRatio: spo2Mult,
        stressMultiplier: stressMult
      }
    });
  };

  // Switch between wearables watches brand simulated
  const handleBrandChange = (brand: WearableBrand) => {
    onUpdateState({
      wearable: {
        ...wearable,
        brand
      }
    });
  };

  // Trigger Gemini customized diagnostic reports
  const handleReportGeneration = async () => {
    setReportLoading(true);
    setReportText(null);
    try {
      const response = await fetch("/api/report/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeline: reportTimeline })
      });
      const data = await response.json();
      setReportText(data.summaryText);
      setCsvContent(data.csvContent);
    } catch (err) {
      console.error("Failed to fetch custom report summary text", err);
      setReportText("Diagnostic report could not connect to cloud servers. Fallback: Controlled arterial pressure (systolicBP < 120 mmHg) with optimized cardiorespiratory training. Standard low-sodium regime suggested.");
    } finally {
      setReportLoading(false);
    }
  };

  // Handles raw CSV browser downloading dynamically
  const downloadReportCsv = () => {
    if (!csvContent) return;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `HealthGuard_${reportTimeline}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl" id="command-hub-center">
      {/* Category Menu Tabs bar */}
      <div className="flex border-b border-slate-800 pb-3 gap-2 flex-wrap mb-5">
        <button
          onClick={() => setActiveTab("family")}
          className={`flex items-center gap-2 py-2 px-3 text-xs font-mono rounded-lg transition cursor-pointer ${
            activeTab === "family" ? "bg-slate-900 border border-slate-700/60 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" /> Family Shared Links
        </button>
        <button
          onClick={() => setActiveTab("emergency")}
          className={`flex items-center gap-2 py-2 px-3 text-xs font-mono rounded-lg transition cursor-pointer ${
            activeTab === "emergency" ? "bg-slate-900 border border-slate-700/60 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-500" /> SOS Crisis Dispatch
        </button>
        <button
          onClick={() => setActiveTab("admin")}
          className={`flex items-center gap-2 py-2 px-3 text-xs font-mono rounded-lg transition cursor-pointer ${
            activeTab === "admin" ? "bg-slate-900 border border-slate-700/60 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          <Cpu className="w-4 h-4 text-amber-500" /> IoT Device Admin & HIPAA
        </button>
        <button
          onClick={() => setActiveTab("report")}
          className={`flex items-center gap-2 py-2 px-3 text-xs font-mono rounded-lg transition cursor-pointer ${
            activeTab === "report" ? "bg-slate-900 border border-slate-700/60 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          <FileDown className="w-4 h-4 text-indigo-400" /> Clinical Report Builder
        </button>
      </div>

      {/* --- MENU VIEWPORTS --- */}

      {/* 2. Emergency Alert SOS view */}
      {activeTab === "emergency" && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-rose-950/20 border border-rose-900/40 p-4 rounded-xl flex gap-3.5">
            <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white text-xs font-semibold uppercase tracking-wide">SOS Emergency Dispatch Controls</h4>
              <p className="text-[11px] text-rose-300 font-sans leading-relaxed mt-1">
                Triggering the Emergency SOS immediately overrides telemetry privacy policies. GPS location, live electrocardiogram waveforms, and medical risk history is transmitted directly to the configured guardian and nearest first aid response unit.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Guardian Endpoint Contact</span>
              
              <div>
                <label className="text-[10px] font-mono text-slate-400">Emergency Guardian Name</label>
                <input 
                  type="text" 
                  value={guardianName} 
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="w-full text-xs font-mono text-white bg-slate-950 border border-slate-850 rounded p-2 mt-1 focus:border-rose-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400">Guardian Phone Cellular</label>
                <input 
                  type="text" 
                  value={guardianPhone} 
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  className="w-full text-xs font-mono text-white bg-slate-950 border border-slate-850 rounded p-2 mt-1 focus:border-rose-900"
                />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Panic Pulse SOS Signal</span>
                <p className="text-[10px] text-slate-400 font-sans leading-normal mt-2">
                  Once pressed, the server app queues an emergency anomaly, issues cellular logs, and transmits live SpO2 and Heart Rate records.
                </p>
              </div>

              <button
                onClick={handleSOSTrigger}
                disabled={sosLoading}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs font-bold uppercase tracking-widest rounded-lg transition shadow-[0_0_15px_rgba(239,68,68,0.2)] mt-4 disabled:opacity-50 cursor-pointer text-center"
              >
                {sosLoading ? "Transmitting GPS Packets..." : "DISPATCH URGENT SOS ALERT"}
              </button>
            </div>
          </div>

          {dispatchLogs && (
            <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-lg text-rose-300 font-mono text-[10px] leading-relaxed whitespace-pre-line border-l-2 border-rose-500">
              {dispatchLogs}
            </div>
          )}
        </div>
      )}

      {/* 1. Family Sharing Dashboard Profiles */}
      {activeTab === "family" && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Shared links allow discrete, cloud-sync monitoring of vulnerable elderly family members. Connected smartwatch models transmit alerts instantly to your centralized notification hub.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {family.map((f) => (
              <div key={f.id} className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2.5 items-center">
                      <span className="p-1.5 bg-slate-950 rounded-lg text-emerald-400">
                        <Smartphone className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-white text-xs font-semibold leading-tight">{f.name}</h4>
                        <span className="text-[9px] font-mono text-slate-500">{f.relation} • Age: {f.age}</span>
                      </div>
                    </div>
                    <span className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${
                      f.status === "critical" 
                        ? "bg-rose-950 text-rose-300 border-rose-800" 
                        : f.status === "warning"
                        ? "bg-amber-950 text-amber-300 border-amber-800"
                        : "bg-emerald-950 text-emerald-400 border-emerald-800"
                    }`}>
                      {f.status}
                    </span>
                  </div>

                  {/* Vitals summary preview of elderly relative */}
                  {f.metrics && (
                    <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-850/60 my-3">
                      <div>
                        <span className="text-[8px] font-mono text-slate-500 block uppercase">Cardiac</span>
                        <span className="text-xs font-bold font-mono text-white mt-0.5 block">{f.metrics.heartRate} bpm</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono text-slate-500 block uppercase">Oxygen</span>
                        <span className="text-xs font-bold font-mono text-white mt-0.5 block">{f.metrics.spo2}% SpO2</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono text-slate-500 block uppercase">Systolic BP</span>
                        <span className={`text-xs font-bold font-mono mt-0.5 block ${f.metrics.systolicBP && f.metrics.systolicBP > 135 ? "text-amber-400" : "text-white"}`}>{f.metrics.systolicBP} mmHg</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-[9px] font-mono text-slate-500 flex justify-between items-center mt-2">
                  <span>Last Smartwatch Sync: {f.lastActive}</span>
                  <span className="text-indigo-400 font-semibold hover:underline cursor-pointer">View full diagnostics →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. IoT Device Admin, Vitals Spiker & HIPAA privacy logs */}
      {activeTab === "admin" && (
        <div className="space-y-5 animate-fade-in">
          {/* SmartWatch Brand simulation toggle */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-emerald-400" /> Smartwatch Wearable Integration Gateway
            </span>
            <div className="grid grid-cols-4 gap-2">
              {Object.values(WearableBrand).map((br) => (
                <button
                  key={br}
                  onClick={() => handleBrandChange(br)}
                  className={`py-2 px-1 text-[9px] font-mono rounded text-center transition cursor-pointer border ${
                    wearable.brand === br
                      ? "bg-emerald-950 text-emerald-400 border-emerald-500/50"
                      : "bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-800"
                  }`}
                >
                  {br}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-500 font-mono mt-2 text-center">
              * Switches the decoding pipeline calibration to match the target wristwatch sensor profile. Current battery: {wearable.battery}%
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* IoT Anomaly spiker */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">IoT Bio-Sensor Signal Spiker</span>
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed mb-4">
                  Forces anomalies in heart rate or SpO2 streams to test how the automated **Isolation Forest** outlier and **Emergency Alerts** systems respond.
                </p>

                <div className="space-y-3">
                  {/* Cardiac Bradycardia toggle */}
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-300">
                    <span>Sinus Bradycardia Pulse (0.6x HR)</span>
                    <button 
                      onClick={() => applySensorTweak(0.6, 1.0, 1.0)}
                      className={`text-[9px] font-mono border rounded px-2 py-0.5 cursor-pointer ${forcedHRMultiplier === 0.6 ? "bg-rose-950 text-rose-300 border-rose-800" : "bg-slate-950 text-slate-400 border-slate-850"}`}
                    >
                      {forcedHRMultiplier === 0.6 ? "Triggered" : "Test"}
                    </button>
                  </div>

                  {/* High Tachycardia spiker */}
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-300">
                    <span>Arrhythmic Tachycardia (1.8x HR)</span>
                    <button 
                      onClick={() => applySensorTweak(1.8, 1.0, 1.2)}
                      className={`text-[9px] font-mono border rounded px-2 py-0.5 cursor-pointer ${forcedHRMultiplier === 1.8 ? "bg-rose-950 text-rose-300 border-rose-800" : "bg-slate-950 text-slate-400 border-slate-850"}`}
                    >
                      {forcedHRMultiplier === 1.8 ? "Triggered" : "Test"}
                    </button>
                  </div>

                  {/* Drop oxygen level */}
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-300">
                    <span>Acute Hypoxia Oxygen Drop (0.91x SpO2)</span>
                    <button 
                      onClick={() => applySensorTweak(1.0, 0.91, 1.3)}
                      className={`text-[9px] font-mono border rounded px-2 py-0.5 cursor-pointer ${forcedSpO2Multiplier === 0.91 ? "bg-rose-950 text-rose-300 border-rose-800" : "bg-slate-950 text-slate-400 border-slate-850"}`}
                    >
                      {forcedSpO2Multiplier === 0.91 ? "Triggered" : "Test"}
                    </button>
                  </div>
                </div>
              </div>

              {(forcedHRMultiplier !== 1.0 || forcedSpO2Multiplier !== 1.0) && (
                <button
                  onClick={() => applySensorTweak(1.0, 1.0, 1.0)}
                  className="w-full mt-4 text-[10px] font-mono py-2 bg-slate-950 border border-slate-800 rounded font-semibold text-emerald-400 uppercase tracking-wider cursor-pointer text-center hover:bg-slate-900"
                >
                  Reset Vitals to Stable baseline
                </button>
              )}
            </div>

            {/* Encrypted HIPAA security audits */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block mb-2.5 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-indigo-400" /> Advanced HIPAA Decryption Audit Trail
              </span>
              <p className="text-[9px] text-slate-400 font-sans leading-normal mb-3">
                Maintains a cryptographically sealed trail logging access keys utilized on biometric streams. Logs satisfy ePHI 45 CFR Part 164.
              </p>

              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-2 bg-slate-950/60 border border-slate-850/50 rounded-lg flex justify-between items-start text-[9px] font-mono">
                    <div>
                      <div className="flex gap-1.5 items-center">
                        <span className="font-semibold text-slate-200">{log.user}</span>
                        <span className="text-slate-500 uppercase">({log.role})</span>
                      </div>
                      <p className="text-indigo-300 mt-1 uppercase tracking-tight">{log.action}</p>
                      <span className="text-slate-500 font-mono text-[8px]">{log.timestamp.split('T')[1].slice(0, 8)} UTC</span>
                    </div>
                    <span className="text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 rounded-md px-1 py-0.5 text-[8px] font-bold">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Report Generator Panel */}
      {activeTab === "report" && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-3.5">
              Select Chronometer Analytics Scale
            </span>
            <div className="flex gap-2">
              {["daily", "weekly", "monthly"].map((t) => (
                <button
                  key={t}
                  onClick={() => setReportTimeline(t as any)}
                  className={`flex-1 py-2 text-xs font-mono rounded capitalize transition cursor-pointer border ${
                    reportTimeline === t
                      ? "bg-emerald-950 text-emerald-400 border-emerald-500/50"
                      : "bg-slate-950 text-zinc-400 border-slate-900 hover:border-slate-850"
                  }`}
                >
                  {t} Summary
                </button>
              ))}
            </div>

            <button
              onClick={handleReportGeneration}
              disabled={reportLoading}
              className="w-full mt-4 bg-indigo-650 hover:bg-indigo-700 text-white py-3 text-xs font-mono font-bold uppercase rounded-lg tracking-wider transition cursor-pointer text-center flex items-center justify-center gap-2"
            >
              {reportLoading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" /> Compiling clinical records...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 text-emerald-300" /> CONSTRUCT CUSTOM AI CLINICAL REPORT
                </>
              )}
            </button>
          </div>

          {/* Render compiled report result */}
          {reportText && (
            <div className="bg-slate-900 border border-indigo-950 p-5 rounded-xl space-y-4 animate-fade-in border-l-4 border-indigo-500">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> Verified Digital Medical Report Overview
                </span>
                <button
                  onClick={downloadReportCsv}
                  className="text-[10px] bg-slate-950 hover:bg-slate-900 border border-slate-800 text-white font-mono px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3" /> Get CSV Sheet
                </button>
              </div>

              <div className="text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap font-sans">
                {reportText}
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>HIPAA Encrypted Signature: <b>E_WARD_MD</b></span>
                <span>Audit Stamp: <b>GRANTED</b></span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

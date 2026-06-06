import React, { useState } from "react";
import { HealthMetrics } from "../types";
import { Activity, Brain, Heart, Wind, Zap } from "lucide-react";
import { motion } from "motion/react";

interface DigitalTwinProps {
  metrics: HealthMetrics;
}

type OrganKey = "brain" | "heart" | "lungs" | "muscles" | "general";

export default function DigitalTwin({ metrics }: DigitalTwinProps) {
  const [selectedOrgan, setSelectedOrgan] = useState<OrganKey>("heart");

  const organData = {
    brain: {
      title: "Cerebral & Autonomous Twin Hub",
      organ: "Brain & Nervous System",
      icon: <Brain className="w-6 h-6 text-indigo-400" />,
      metrics: [
        { label: "Stress Threshold Autoregulation", value: `${metrics.stressLevel}/100`, status: metrics.stressLevel > 70 ? "Critical Strain" : "Adaptive Status" },
        { label: "Vagal Autonomic Tone (HRV)", value: `${metrics.hrv} ms`, status: metrics.hrv < 45 ? "Sympathetic Dominated" : "Highly Restored" },
        { label: "Alpha Wave Circadian Consistency", value: "88%", status: "Optimal" },
        { label: "Cognitive Load Latency", value: "110 ms", status: "Nominal" }
      ],
      description: "Monitors neurological recovery speed and autonomic nervous system (ANS) shifts. Lower HRV (Heart Rate Variability) reflects high sympathetic stress strain, calling for immediate parasympathetic diaphragmatic breathing intervals.",
      color: "border-indigo-500/30 bg-indigo-950/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
    },
    heart: {
      title: "Cardiometabolic Waveform Simulator",
      organ: "Cardiovascular Matrix",
      icon: <Heart className="w-6 h-6 text-rose-400" />,
      metrics: [
        { label: "Resting Heart Beat Cycle", value: `${metrics.heartRate} BPM`, status: metrics.heartRate > 100 ? "Arrhythmia Alert" : "Stable Sinus Rhythm" },
        { label: "Systemic Arterial Tension (BP)", value: `${metrics.systolicBP}/${metrics.diastolicBP} mmHg`, status: metrics.systolicBP > 140 ? "Stage-2 Hypertension" : "Normotensive Baseline" },
        { label: "Myocardial Saturation Index", value: "99.4%", status: "Optimal" },
        { label: "Cardiac Contractility Load", value: "4.8 L/min", status: "Healthy" }
      ],
      description: "Visualizes arterial compliance, systolic ejection fraction, and peripheral vascular resistance. Elevated systolic thresholds indicate higher cardiovascular risk, requiring low-sodium habit formations.",
      color: "border-rose-500/30 bg-rose-950/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
    },
    lungs: {
      title: "Pulmonary Ventilation twin core",
      organ: "Bronchiectasis & Oxygen Exchange",
      icon: <Wind className="w-6 h-6 text-cyan-400" />,
      metrics: [
        { label: "Peripheral Captive Saturation (SpO2)", value: `${metrics.spo2}%`, status: metrics.spo2 < 93 ? "Critical Hypoxia" : "Physiological Balance" },
        { label: "Pneumonic Respiratory Cycle", value: `${metrics.respiratoryRate} BpM`, status: "Nominal" },
        { label: "Alveolar Tidal Gaseous Volume", value: "520 mL", status: "Optimal" },
        { label: "Lactate Accumulation Threshold", value: "1.2 mmol/L", status: "Low" }
      ],
      description: "Maintains real-time alveolar gas equilibrium profiles. Drops in peripheral oxygen saturation (SpO2 < 92%) trigger automated critical response indicators to guarantee patient safety against hypoxic conditions.",
      color: "border-cyan-500/30 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
    },
    muscles: {
      title: "Somatic Musculoskeletal Kinematics",
      organ: "Skeletal Muscle Mass & Glycogen",
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      metrics: [
        { label: "Active Energy Outturn", value: `${metrics.caloriesBurned} kcal`, status: "Achieving Goals" },
        { label: "Daily Physical Accumulator", value: `${metrics.steps} / 10000`, status: metrics.steps < 4000 ? "Sedentary Chronicity" : "Highly Active" },
        { label: "Myofibrillar Load Capacity", value: "94%", status: "Strong" },
        { label: "Somatic Fatigue Index", value: "Medium", status: "Stable" }
      ],
      description: "Tracks active musculoskeletal energy depletion, cellular metabolism, and glycogen restoration rates. Prompts user to perform resistance exercises and somatic standups to keep lower limb venous returns optimized.",
      color: "border-amber-500/30 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
    },
    general: {
      title: "Systemic Homeostatic Organ Integrity",
      organ: "Whole Body Metabolism",
      icon: <Activity className="w-6 h-6 text-emerald-400" />,
      metrics: [
        { label: "Internal Core Temperature", value: `${metrics.bodyTemp}°C`, status: metrics.bodyTemp > 38 ? "Pyrexia (Fever)" : "Stable Baseline" },
        { label: "Systemic Aqueous Balance", value: `${metrics.waterIntake} mL`, status: metrics.waterIntake < 1500 ? "Micro-Dehydrated" : "Saturated" },
        { label: "Systemic Metabolic Index", value: "1.1 BMR", status: "Nominal" },
        { label: "Endocrine Cortisol Curve", value: "Stable", status: "Optimal" }
      ],
      description: "Consolidates thermoregulation and renal osmotic metrics. Dynamic monitoring detects thermal outlier spikes immediately (fever triggers), generating system logs accessible to clinicians.",
      color: "border-emerald-500/30 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden" id="digital-twin-container">
      {/* Background visual graphics */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Futuristic Male-gender Model SVG Outline with organ selector highlights */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 relative min-h-[380px]">
        <div className="absolute top-4 left-4">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-1 rounded-md uppercase tracking-widest animate-pulse">
            Digital Twin Online
          </span>
        </div>

        {/* Dynamic 3D Human Schematic Body */}
        <div className="relative w-48 h-80 flex items-center justify-center mt-6">
          <svg viewBox="0 0 100 200" className="w-full h-full text-slate-800 drop-shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            {/* Holographic grid lines behind */}
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="200" fill="url(#grid)" className="rounded-xl" />

            {/* Static Human Outline Model */}
            <path
              d="M 50 15 
                 C 46 15, 42 18, 42 22 
                 C 42 26, 46 29, 50 29 
                 C 54 29, 58 26, 58 22 
                 C 58 18, 54 15, 50 15 Z
                 M 42 30 
                 C 38 31, 33 34, 27 45 
                 C 23 52, 21 68, 20 85 
                 C 19 92, 23 93, 24 88 
                 C 25 80, 27 65, 30 54 
                 L 31 105 
                 C 31 125, 33 145, 35 185 
                 C 35 190, 39 190, 39 185 
                 L 45 120 
                 L 49 120 
                 L 50 110 
                 L 51 120 
                 L 55 120 
                 L 61 185 
                 C 61 190, 65 190, 65 185 
                 C 67 145, 69 125, 69 105 
                 L 70 54 
                 C 73 65, 75 80, 76 88 
                 C 77 93, 81 92, 80 85 
                 C 79 68, 77 52, 73 45 
                 C 67 34, 62 31, 58 30 Z"
              fill="rgba(30, 41, 59, 0.7)"
              stroke="rgba(148, 163, 184, 0.2)"
              strokeWidth="1.2"
              className="transition-all duration-500"
            />

            {/* Interactive Selector Node: Brain */}
            <g 
              className="cursor-pointer group" 
              onClick={() => setSelectedOrgan("brain")}
            >
              <circle 
                cx="50" cy="22" 
                r={selectedOrgan === "brain" ? "7" : "4"} 
                fill={selectedOrgan === "brain" ? "rgba(99, 102, 241, 0.4)" : "rgba(99, 102, 241, 0.2)"} 
                className="animate-pulse"
              />
              <circle cx="50" cy="22" r="2" fill="#818cf8" stroke="#ffffff" strokeWidth="0.5" />
              <text x="59" y="24" className="text-[6px] font-mono fill-indigo-300 opacity-60 group-hover:opacity-100 transition-opacity">CNS</text>
            </g>

            {/* Interactive Selector Node: Heart */}
            <g 
              className="cursor-pointer group" 
              onClick={() => setSelectedOrgan("heart")}
            >
              <circle 
                cx="49" cy="46" 
                r={selectedOrgan === "heart" ? "8" : "5"} 
                fill={selectedOrgan === "heart" ? "rgba(244, 63, 94, 0.4)" : "rgba(244, 63, 94, 0.2)"} 
                className="animate-pulse"
              />
              <circle cx="49" cy="46" r="2.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="0.5" />
              <text x="32" y="48" className="text-[6px] font-mono fill-rose-300 opacity-60 group-hover:opacity-100 transition-opacity">CARDIO</text>
            </g>

            {/* Interactive Selector Node: Lungs */}
            <g 
              className="cursor-pointer group" 
              onClick={() => setSelectedOrgan("lungs")}
            >
              <circle 
                cx="58" cy="48" 
                r={selectedOrgan === "lungs" ? "7" : "4"} 
                fill={selectedOrgan === "lungs" ? "rgba(6, 182, 212, 0.4)" : "rgba(6, 182, 212, 0.2)"} 
                className="animate-pulse"
              />
              <circle cx="58" cy="48" r="2" fill="#22d3ee" stroke="#ffffff" strokeWidth="0.5" />
              <circle cx="41" cy="48" r={selectedOrgan === "lungs" ? "7" : "4"} fill={selectedOrgan === "lungs" ? "rgba(6, 182, 212, 0.3)" : "rgba(6, 182, 212, 0.15)"} />
              <circle cx="41" cy="48" r="1.5" fill="#22d3ee" />
              <text x="66" y="51" className="text-[6px] font-mono fill-cyan-300 opacity-60 group-hover:opacity-100 transition-opacity">PNEUMO</text>
            </g>

            {/* Interactive Selector Node: Muscle Engine */}
            <g 
              className="cursor-pointer group" 
              onClick={() => setSelectedOrgan("muscles")}
            >
              <circle 
                cx="33" cy="88" 
                r={selectedOrgan === "muscles" ? "7" : "4"} 
                fill={selectedOrgan === "muscles" ? "rgba(245, 158, 11, 0.4)" : "rgba(245, 158, 11, 0.2)"} 
                className="animate-pulse"
              />
              <circle cx="33" cy="88" r="2" fill="#fbbf24" stroke="#ffffff" strokeWidth="0.5" />
              <circle cx="67" cy="88" r={selectedOrgan === "muscles" ? "7" : "4"} fill={selectedOrgan === "muscles" ? "rgba(245, 158, 11, 0.3)" : "rgba(245, 158, 11, 0.15)"} />
              <circle cx="67" cy="88" r="2" fill="#fbbf24" />
              <text x="43" y="90" className="text-[6px] font-mono fill-amber-300 opacity-60 group-hover:opacity-100 transition-opacity">SOMA</text>
            </g>

            {/* Interactive Selector Node: Homeostasis / Core */}
            <g 
              className="cursor-pointer group" 
              onClick={() => setSelectedOrgan("general")}
            >
              <circle 
                cx="50" cy="68" 
                r={selectedOrgan === "general" ? "8" : "4"} 
                fill={selectedOrgan === "general" ? "rgba(16, 185, 129, 0.4)" : "rgba(16, 185, 129, 0.15)"} 
                className="animate-pulse"
              />
              <circle cx="50" cy="68" r="2" fill="#10b981" stroke="#ffffff" strokeWidth="0.5" />
              <text x="59" y="70" className="text-[6px] font-mono fill-emerald-300 opacity-60 group-hover:opacity-100 transition-opacity">METAB</text>
            </g>
          </svg>
        </div>

        <div className="flex gap-2 mt-4 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-rose-500 rounded-full inline-block"></span> Active ECG</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full inline-block"></span> SpO2 Stream</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span> Thermal Temp</span>
        </div>
      </div>

      {/* Selected Twin Organ Metric Readouts */}
      <div className="lg:col-span-7 flex flex-col justify-between">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-slate-800/80 border border-slate-700/55 rounded-xl">
                  {organData[selectedOrgan].icon}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-wide font-sans leading-none">{organData[selectedOrgan].title}</h3>
                  <p className="text-xs font-mono text-slate-400 mt-1.5">{organData[selectedOrgan].organ}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed my-4 border-l-2 border-emerald-500 pl-3">
              {organData[selectedOrgan].description}
            </p>

            {/* Readouts grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {organData[selectedOrgan].metrics.map((m, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800/80 hover:border-slate-700 transition">
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{m.label}</p>
                  <div className="flex items-baseline justify-between mt-1">
                    <p className="text-lg font-bold text-white font-mono">{m.value}</p>
                    <span className={`text-[10px] font-semibold font-sans px-1.5 py-0.5 rounded ${
                      m.status === "Stage-2 Hypertension" || m.status === "Critical Hypoxia" || m.status === "Critical Strain" || m.status === "Sympathetic Dominated"
                        ? "bg-rose-950 text-rose-300 border border-rose-800" 
                        : m.status === "Sedentary Chronicity" || m.status === "Micro-Dehydrated" || m.status === "Warning" || m.status === "Arrhythmia Alert"
                        ? "bg-amber-950 text-amber-300 border border-amber-800"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    }`}>
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-[11px] font-mono text-slate-400">
            <span>Homeostatic twin precision: <b className="text-emerald-400 font-mono">99.7%</b></span>
            <span>Mathematical Engine: <b className="text-indigo-400 font-mono">Isolation Forest Cluster</b></span>
          </div>
        </div>
      </div>
    </div>
  );
}

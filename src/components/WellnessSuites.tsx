import React, { useState, useEffect } from "react";
import { HealthMetrics, Habit } from "../types";
import { 
  Zap, 
  Wind, 
  Moon, 
  Smile, 
  Calendar, 
  Award, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Coffee, 
  Activity,
  ThumbsUp,
  RefreshCw
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface WellnessSuitesProps {
  metrics: HealthMetrics;
  habits: Habit[];
  onUpdateState: (payload: { metrics?: Partial<HealthMetrics>; habits?: Habit[] }) => void;
}

// Simulated hypnogram dataset (EEG sleep cycles over the night)
const hypnogramData = [
  { time: "22:00", stage: 0 }, // Awake
  { time: "23:00", stage: 1 }, // Light
  { time: "00:00", stage: 2 }, // Deep
  { time: "01:00", stage: 3 }, // REM
  { time: "02:00", stage: 2 }, // Deep
  { time: "03:00", stage: 1 }, // Light
  { time: "04:00", stage: 3 }, // REM
  { time: "05:00", stage: 2 }, // Deep
  { time: "06:00", stage: 1 }, // Light
  { time: "07:00", stage: 0 }  // Awake
];

// Activity intensity timeline (hourly metabolic trends)
const hourlyActivityData = [
  { hour: "08:00", steps: 220, stress: 30 },
  { hour: "10:00", steps: 1100, stress: 62 },
  { hour: "12:00", steps: 450, stress: 45 },
  { hour: "14:00", steps: 1540, stress: 78 },
  { hour: "16:00", steps: 2500, stress: 52 },
  { hour: "18:00", steps: 890, stress: 35 },
  { hour: "20:00", steps: 350, stress: 28 }
];

export function SleepModule({ metrics }: { metrics: HealthMetrics }) {
  // Analytical score derived from metrics
  const sleepEfficiency = Math.round((metrics.sleepDuration / 8.2) * 100);
  const consistencyScore = 86; // out of 100

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between" id="sleep-suite">
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <Moon className="w-5 h-5 text-indigo-400" />
          <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Sleep Architecture Engine</h3>
        </div>

        {/* Efficiency dashboard header */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 text-center">
            <span className="text-[9px] font-mono text-slate-500 uppercase">Efficiency</span>
            <p className="text-sm font-bold text-white font-mono mt-0.5">{sleepEfficiency}%</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 text-center">
            <span className="text-[9px] font-mono text-slate-500 uppercase">EEG Deep Rest</span>
            <p className="text-sm font-bold text-indigo-400 font-mono mt-0.5">2h 14m</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 text-center">
            <span className="text-[9px] font-mono text-slate-500 uppercase">Sleep Score</span>
            <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{consistencyScore}/100</p>
          </div>
        </div>

        {/* Interactive Hypnogram */}
        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">Holographic Hypnogram (EEG Slumber Stages)</p>
        <div className="h-36 mb-4 bg-slate-950/40 p-2 rounded-lg border border-slate-800/30">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hypnogramData}>
              <defs>
                <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#475569" fontSize={9} tickLine={false} />
              <YAxis 
                stroke="#475569" 
                fontSize={8} 
                tickLine={false} 
                domain={[0, 3]} 
                ticks={[0, 1, 2, 3]}
                tickFormatter={(val) => {
                  if (val === 0) return "Awake";
                  if (val === 1) return "Light";
                  if (val === 2) return "Deep";
                  return "REM";
                }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontSize: "10px", fontFamily: "monospace" }} 
                labelStyle={{ color: "#fff" }}
              />
              <Area type="monotone" dataKey="stage" stroke="#818cf8" strokeWidth={1.5} fillOpacity={1} fill="url(#colorSleep)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="text-[11px] text-slate-300 font-sans leading-relaxed space-y-2">
          <p className="flex gap-1.5"><span className="text-indigo-400 font-bold">•</span> Sleep onset lag resolved successfully at <b className="text-indigo-300 font-mono">22:42</b>.</p>
          <p className="flex gap-1.5"><span className="text-emerald-400 font-bold">•</span> Dynamic oxygen exchange indices remained highly stable throughout slumbers.</p>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500">
        Clinical Diagnostic Profile: Sleep Apnea Index &lt;1.2 IA/hr (Low risk).
      </div>
    </div>
  );
}

export function StressBreathingModule({ metrics, onUpdateState }: { metrics: HealthMetrics; onUpdateState: WellnessSuitesProps["onUpdateState"] }) {
  const [breathingPhase, setBreathingPhase] = useState<"holding" | "inhale" | "exhale" | "ready">("ready");
  const [breathingTimer, setBreathingTimer] = useState(0);
  const [breathingCycles, setBreathingCycles] = useState(0);
  const [resonanceActive, setResonanceActive] = useState(false);

  // Dynamic instructional banners based on current breathing stage of the 4-7-8 system
  const instructions = {
    ready: "Ready to stabilize autonomic nervous system? Press below.",
    inhale: "Inhale Slowly through the nasal path. Contract diaphragm.",
    holding: "Lock pulmonary valves. Suspend blood air boundaries.",
    exhale: "Exhale through somatic vocal tubes. Lower cardiac strain."
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resonanceActive) {
      interval = setInterval(() => {
        setBreathingTimer(prev => {
          if (breathingPhase === "inhale" && prev >= 4) {
            setBreathingPhase("holding");
            return 0;
          }
          if (breathingPhase === "holding" && prev >= 7) {
            setBreathingPhase("exhale");
            return 0;
          }
          if (breathingPhase === "exhale" && prev >= 8) {
            setBreathingPhase("inhale");
            setBreathingCycles(c => {
              const newCount = c + 1;
              if (newCount === 3) {
                // Instantly lower simulated stress level on completing resonance sets
                onUpdateState({
                  metrics: {
                    stressLevel: Math.max(10, metrics.stressLevel - 20),
                    hrv: Math.min(120, metrics.hrv + 15),
                    heartRate: Math.max(55, metrics.heartRate - 8)
                  }
                });
              }
              return newCount;
            });
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resonanceActive, breathingPhase, metrics, onUpdateState]);

  const toggleResonance = () => {
    if (resonanceActive) {
      setResonanceActive(false);
      setBreathingPhase("ready");
      setBreathingTimer(0);
    } else {
      setResonanceActive(true);
      setBreathingPhase("inhale");
      setBreathingTimer(0);
      setBreathingCycles(0);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between" id="stress-suite">
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <Wind className="w-5 h-5 text-emerald-400" />
          <h3 className="text-white text-sm font-semibold uppercase tracking-wider font-sans">Parasympathetic Resonance</h3>
        </div>

        <div className="flex flex-col items-center justify-center py-4 relative">
          {/* Pulsating Diaphragmatic Breath Visualizer Circle */}
          <div className="w-32 h-32 flex items-center justify-center relative">
            {/* Soft backdrop glows */}
            <div className={`absolute rounded-full filter blur-md transition-all duration-[4s] ease-in-out ${
              breathingPhase === "inhale" ? "w-28 h-28 bg-emerald-500/20 shadow-[0_0_20px_#10b981]" :
              breathingPhase === "holding" ? "w-28 h-28 bg-indigo-500/40 shadow-[0_0_20px_#6366f1]" :
              breathingPhase === "exhale" ? "w-16 h-16 bg-rose-500/15" : "w-20 h-20 bg-slate-850"
            }`} />

            {/* Inner concentric animated tracking element */}
            <div className={`rounded-full flex flex-col items-center justify-center border text-center transition-all bg-slate-950 shadow-inner z-10 ${
              breathingPhase === "inhale" ? "w-24 h-24 border-emerald-500/40 scale-110 ease-in" :
              breathingPhase === "holding" ? "w-24 h-24 border-indigo-400/50 scale-110" :
              breathingPhase === "exhale" ? "w-16 h-16 border-rose-500/30 scale-90 ease-out" : "w-18 h-18 border-slate-800"
            }`}>
              {resonanceActive ? (
                <>
                  <span className="text-xl font-bold font-mono text-white leading-none">{breathingTimer}s</span>
                  <span className="text-[8px] font-mono text-slate-400 uppercase mt-0.5 tracking-wider">{breathingPhase}</span>
                </>
              ) : (
                <Smile className="w-6 h-6 text-slate-500" />
              )}
            </div>
          </div>

          <p className="text-[11px] text-center text-slate-300 font-sans px-4 mt-5 min-h-[32px] leading-relaxed">
            {instructions[breathingPhase]}
          </p>

          {breathingCycles > 0 && (
            <span className="text-[10px] font-mono text-indigo-400 mt-2 bg-indigo-950/40 border border-indigo-900/50 px-2 py-0.5 rounded-full">
              Stable Cycles Finished: {breathingCycles} / 3 Sets
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 space-y-3">
        <button
          onClick={toggleResonance}
          className={`w-full py-2.5 rounded-lg text-xs font-mono font-semibold tracking-wider uppercase transition cursor-pointer text-center ${
            resonanceActive 
              ? "bg-rose-950/80 text-rose-300 border border-rose-800/50" 
              : "bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800"
          }`}
        >
          {resonanceActive ? "Deactivate Resonant Breathing" : "Initiate Resonant Breathing (4-7-8)"}
        </button>

        {breathingCycles >= 3 && (
          <div className="bg-emerald-950/20 text-[10px] text-emerald-400 border border-emerald-800/40 p-2 rounded-lg text-center font-sans">
            🎉 <b>Therapeutic Goal Target Gained!</b> Parasympathetic stimulation activated. Systemic Stress level reduced by 20 points!
          </div>
        )}
      </div>
    </div>
  );
}

export function FitnessModule({ metrics, habits, onUpdateState }: WellnessSuitesProps) {
  // Analytical fitness indicator
  const fitnessScore = Math.round((metrics.steps / 10000) * 45 + (metrics.caloriesBurned / 2500) * 55);

  const toggleHabit = (idx: string) => {
    const updated = habits.map(h => {
      if (h.id === idx) {
        const toggleVal = !h.completedToday;
        return { 
          ...h, 
          completedToday: toggleVal,
          streak: toggleVal ? h.streak + 1 : Math.max(0, h.streak - 1)
        };
      }
      return h;
    });
    onUpdateState({ habits: updated });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between" id="fitness-suite">
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Fitness & Activity Matrix</h3>
        </div>

        {/* Dynamic metabolic tracking */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/60">
            <span className="text-[9px] font-mono text-slate-500 uppercase">Calculated Metabolic Rate</span>
            <div className="flex justify-between mt-1 items-baseline">
              <span className="text-base font-bold text-white font-mono">{metrics.caloriesBurned}</span>
              <span className="text-[8px] font-mono text-slate-400">kcal burned</span>
            </div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/60">
            <span className="text-[9px] font-mono text-slate-500 uppercase">Interactive Fitness Performance</span>
            <div className="flex justify-between mt-1 items-baseline">
              <span className="text-base font-bold text-amber-400 font-mono">{Math.min(100, fitnessScore)}/100</span>
              <span className="text-[8px] font-mono text-emerald-400">+4% week</span>
            </div>
          </div>
        </div>

        {/* Dynamic Goals milestones roadmap */}
        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-amber-500" /> Premium Goals Milestone Roadmap
        </p>
        <div className="relative p-3.5 bg-slate-950 rounded-xl border border-slate-850 space-y-3.5">
          {/* Milestone 1 */}
          <div className="flex gap-3">
            <div className="relative flex flex-col items-center">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${metrics.steps >= 6000 ? "bg-emerald-500/20 border-emerald-500" : "bg-slate-900 border-slate-700"}`}>
                {metrics.steps >= 6000 && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
              </div>
              <div className="w-0.5 h-full bg-slate-800" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white tracking">Phase I: Somatic Standup (6k Steps)</p>
              <p className="text-[9px] text-slate-400">Keeps venous circulatory return active. Status: {metrics.steps >= 6000 ? "Verified" : "Pending"}</p>
            </div>
          </div>

          {/* Milestone 2 */}
          <div className="flex gap-3">
            <div className="relative flex flex-col items-center">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${metrics.steps >= 10000 ? "bg-emerald-500/20 border-emerald-500" : "bg-slate-900 border-slate-700"}`}>
                {metrics.steps >= 10000 && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
              </div>
              <div className="w-0.5 h-6 bg-slate-800" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white">Phase II: Aerobic Vascular Reserve (10k Steps)</p>
              <p className="text-[9px] text-slate-400">Dilation of the vascular tree to optimize blood flow. Status: {metrics.steps >= 10000 ? "Verified" : "Pending"}</p>
            </div>
          </div>
        </div>

        {/* Smart Habit Habits checklists */}
        <div className="mt-4 pt-3 border-t border-slate-850">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Smart Habit Formation Checklist
          </p>
          <div className="space-y-2">
            {habits.map((hb) => (
              <div key={hb.id} className="flex justify-between items-center bg-slate-950/60 p-2 rounded-lg border border-slate-900">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hb.completedToday}
                    onChange={() => toggleHabit(hb.id)}
                    className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-800 accent-emerald-500 cursor-pointer"
                  />
                  <div>
                    <p className={`text-[11px] text-slate-200 ${hb.completedToday ? "line-through text-slate-500" : ""}`}>{hb.title}</p>
                    <span className="text-[8px] font-mono text-slate-500 block">Cue: {hb.cue}</span>
                  </div>
                </div>
                <span className="bg-indigo-950/60 border border-indigo-900/50 text-indigo-400 text-[8px] font-mono px-1.5 py-0.5 rounded-full shrink-0">
                  Streak: {hb.streak}d
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-850 text-[10px] font-mono text-slate-500 flex justify-between">
        <span>Skeletal Index: <b className="text-emerald-400">Normal</b></span>
        <span>Goal completions: <b className="text-indigo-400">50%</b></span>
      </div>
    </div>
  );
}

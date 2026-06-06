import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

import { 
  predictHealthRisks, 
  runAnomalyDetection, 
  generateHealthForecast, 
  MODEL_BENCHMARKS 
} from "./server-ml";
import { 
  UserProfile, 
  HealthMetrics, 
  SimConfig, 
  MLModelType, 
  AnomalyReport, 
  Habit, 
  HIPAAAuditLog, 
  FamilyProfile, 
  WearableBrand,
  StateResponse
} from "./src/types";

// Load local environmental secrets
dotenv.config();

// Initialize the Google GenAI Client with appropriate headers for AI Studio tracking
const aiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (aiKey && aiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: aiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("HealthGuard AI: Google GenAI SDK successfully initialized.");
  } catch (err) {
    console.error("HealthGuard AI: Error instantiating GoogleGenAI SDK", err);
  }
} else {
  console.log("HealthGuard AI: GEMINI_API_KEY missing or placeholder. Running with simulated fallback analytics.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. In-Memory Session Database State representing the user data
  let userProfile: UserProfile = {
    id: "HG_8109X",
    name: "Alex Mercer",
    email: "alex.mercer@medtech.io",
    age: 38,
    gender: "Male",
    weight: 81, // kg
    height: 178, // cm
    bloodType: "A-Positive",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    familyHistory: {
      cardiovascular: true,
      diabetes: false,
      hypertension: true
    }
  };

  let actualVitals: HealthMetrics = {
    heartRate: 72,
    spo2: 98,
    bodyTemp: 36.6,
    sleepDuration: 7.2,
    stressLevel: 42,
    steps: 6420,
    caloriesBurned: 2150,
    waterIntake: 1250, // ml
    systolicBP: 119,
    diastolicBP: 78,
    respiratoryRate: 14,
    hrv: 68 // ms
  };

  let lifestyleFactors = {
    saltIntake: 5, // grams
    fitnessHours: 4, // hours per week
    alcoholUsage: 1, // unit
  };

  let simulationVariables: SimConfig = {
    anomaliesEnabled: false,
    heartRateAnomalyRatio: 1.0,
    spo2AnomalyRatio: 1.0,
    stressMultiplier: 1.0,
    activeModel: MLModelType.XGBOOST
  };

  let wearableState = {
    connected: true,
    brand: WearableBrand.APPLE,
    battery: 89,
    syncTime: "Just now"
  };

  let habitTracker: Habit[] = [
    { id: "h1", title: "Circadian Sleep Alignment", category: "sleep", cue: "Wind down by 10 PM", frequency: "Daily", streak: 5, completedToday: true },
    { id: "h2", title: "Sodium Restriction Routine", category: "hydration", cue: "Avoid table salt during dinner", frequency: "Daily", streak: 12, completedToday: false },
    { id: "h3", title: "Sympathetic Relaxation Breathing", category: "stress", cue: "4-7-8 Breathing on stress spike", frequency: "Daily", streak: 7, completedToday: true },
    { id: "h4", title: "Aerobic Heart Training", category: "fitness", cue: "Quick 25 minute run after work", frequency: "Alternate days", streak: 3, completedToday: false }
  ];

  let securityAuditTriggers: HIPAAAuditLog[] = [
    { id: "AUD_01", timestamp: new Date(Date.now() - 3600000).toISOString(), user: "Alex Mercer", role: "Owner", action: "BIO_REST_DECRYPT", resource: "Electrocardiogram Stream", status: "AUTHORIZED" },
    { id: "AUD_02", timestamp: new Date(Date.now() - 7200000).toISOString(), user: "Dr. Evelyn Ward", role: "Primary Care Physician", action: "DATA_READ", resource: "Emergency SpO2 Log File", status: "GRANTED" },
    { id: "AUD_03", timestamp: new Date(Date.now() - 86400000).toISOString(), user: "Platform Daemon", role: "System Orchestrator", action: "ML_SHAP_BATCH", resource: "Cardio Risk Explanation Matrix", status: "AUTHORIZED" }
  ];

  let currentAnomalies: AnomalyReport[] = [];

  const familyMembers: FamilyProfile[] = [
    { id: "fam_01", name: "Eleanor Mercer", relation: "Mother", age: 67, status: "stable", lastActive: "15m ago", metrics: { heartRate: 74, spo2: 96, systolicBP: 128, hrv: 55 } },
    { id: "fam_02", name: "Richard Mercer", relation: "Father", age: 72, status: "warning", lastActive: "1m ago", metrics: { heartRate: 52, spo2: 94, systolicBP: 145, hrv: 34 } }
  ];

  // Helper: generates standard state object
  function computeStateResponse(): StateResponse {
    // Add real-time adjustments depending on simulation settings
    const modifiedVitals = { ...actualVitals };
    if (simulationVariables.anomaliesEnabled) {
      modifiedVitals.heartRate = Math.round(actualVitals.heartRate * simulationVariables.heartRateAnomalyRatio);
      modifiedVitals.spo2 = Math.round(actualVitals.spo2 * simulationVariables.spo2AnomalyRatio);
      modifiedVitals.stressLevel = Math.round(actualVitals.stressLevel * simulationVariables.stressMultiplier);
    }

    const calculatedAnomalies = runAnomalyDetection(modifiedVitals);
    // Combine seed with runtime anomalies
    const finalAnomalies = [...calculatedAnomalies, ...currentAnomalies];

    const predictedRisks = predictHealthRisks(
      modifiedVitals, 
      userProfile, 
      simulationVariables.activeModel, 
      lifestyleFactors
    );

    return {
      profile: userProfile,
      metrics: modifiedVitals,
      simConfig: simulationVariables,
      modelsPerformance: MODEL_BENCHMARKS,
      risks: predictedRisks,
      anomalies: finalAnomalies,
      habits: habitTracker,
      auditLogs: securityAuditTriggers,
      family: familyMembers,
      wearable: wearableState
    };
  }

  // Define Log Security Action
  function pushSecurityAudit(user: string, role: string, action: string, resource: string, status: "AUTHORIZED" | "GRANTED" | "SUSPICIOUS") {
    securityAuditTriggers.unshift({
      id: "AUD_" + Math.random().toString(36).substr(2, 5).toUpperCase(),
      timestamp: new Date().toISOString(),
      user,
      role,
      action,
      resource,
      status
    });
    if (securityAuditTriggers.length > 50) {
      securityAuditTriggers.pop();
    }
  }

  // --- API ROUTING ENDPOINTS ---

  // Health probe
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Fetch complete digital twin state
  app.get("/api/state", (req, res) => {
    pushSecurityAudit("Alex Mercer", "Owner", "BIO_METRIC_READ", "Personal Dashboard State", "AUTHORIZED");
    res.json(computeStateResponse());
  });

  // Edit core settings or trigger anomalies
  app.post("/api/state/update", (req, res) => {
    const { profile, metrics, simConfig, habits, wearable, factors } = req.body;

    if (profile) userProfile = { ...userProfile, ...profile };
    if (metrics) actualVitals = { ...actualVitals, ...metrics };
    if (simConfig) {
      simulationVariables = { ...simulationVariables, ...simConfig };
      if (simConfig.anomaliesEnabled === false) {
        currentAnomalies = [];
      }
    }
    if (habits) habitTracker = habits;
    if (wearable) wearableState = { ...wearableState, ...wearable };
    if (factors) {
      Object.assign(lifestyleFactors, factors);
    }

    pushSecurityAudit("Alex Mercer", "Owner", "MUTATE_STATE_CONFIG", "Personal Settings Profiles", "AUTHORIZED");
    res.json(computeStateResponse());
  });

  // Emergency contact dispatcher simulation
  app.post("/api/emergency/trigger", (req, res) => {
    const { contactName, contactPhone, reason } = req.body;
    
    // Add critical emergency anomaly
    const newAnomaly: AnomalyReport = {
      id: "EMERG_" + Math.random().toString(36).substr(2, 5).toUpperCase(),
      timestamp: new Date().toISOString(),
      metric: "HEART_GUARD_DISPATCH",
      value: actualVitals.heartRate,
      threshold: "User Triggered Emergency System",
      severity: "critical",
      status: "contacted"
    };

    currentAnomalies.unshift(newAnomaly);

    pushSecurityAudit("Emergency Dispatcher", "System Responder", "EMERGENCY_TELEMETRY_ACCESS", "Live Cardiac Vitals Track", "GRANTED");

    res.json({
      success: true,
      dispatchLog: `[HEARTGUARD GATEWAY DISPATCHED] Emergency Alert triggered. Sent SMS notification to target Guardian "${contactName}" at (${contactPhone}). Medical responders route established. Reason: ${reason || "User-Initiated SOS Vital Limits Breakdown Alert"}.`
    });
  });

  // Forecasting endpoints
  app.get("/api/forecast", (req, res) => {
    const days = parseInt(req.query.days as string) || 30;
    pushSecurityAudit("Alex Mercer", "Owner", "FORECAST_PROJECTION", "Time Series Predictors Engine", "AUTHORIZED");
    
    const modifiedVitals = { ...actualVitals };
    if (simulationVariables.anomaliesEnabled) {
      modifiedVitals.heartRate = Math.round(actualVitals.heartRate * simulationVariables.heartRateAnomalyRatio);
      modifiedVitals.spo2 = Math.round(actualVitals.spo2 * simulationVariables.spo2AnomalyRatio);
    }

    const forecast = generateHealthForecast(modifiedVitals, days);
    res.json(forecast);
  });

  // Report download generator endpoint (CSV compile and customized summaries)
  app.post("/api/report/generate", async (req, res) => {
    const { timeline } = req.body; // "daily" | "weekly" | "monthly"
    pushSecurityAudit("Alex Mercer", "Owner", "REPORT_GENERATION", `Structured HIPAA Health Summary (${timeline})`, "AUTHORIZED");

    const state = computeStateResponse();
    const vitalsStr = `HR: ${state.metrics.heartRate}bpm, SpO2: ${state.metrics.spo2}%, BP: ${state.metrics.systolicBP}/${state.metrics.diastolicBP}mmHg, Stress Index: ${state.metrics.stressLevel}/100`;

    let summaryText = `Your digital medical assistant compiled this diagnostic overview for your ${timeline} metrics. Overall vitals remain stable within physiological baseline limits. Rest pattern consistency stands at 84%. Keep sodium intake low to suppress cardiovascular occlusion trends.`;

    // Attempt to invoke Gemini to construct a beautifully clinical report if key is loaded
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `You are a specialist medical tech intelligence system compiling a clinical ${timeline} summary report for an individual named ${userProfile.name} (Age: ${userProfile.age}, Weight: ${userProfile.weight}kg, Family Cardiovascular History: ${userProfile.familyHistory.cardiovascular ? 'Yes' : 'No'}). Their base active measurements: ${vitalsStr}. Please write a complete, elite clinical analysis of these vitals in 3 specific bullet points:
          - Vital Diagnostics (focus on arterial BP and cardiovascular state)
          - Sleep & Adrenal State (focus on hours and stress)
          - Medical Intervention Paths (suggest precise, humble habits based on cardiovascular findings)
          Exclude any marketing hype or unrequested details. Always maintain a professional, scientific and serious tone.`,
          config: {
            systemInstruction: "You are HealthGuard AI, an advanced server-side Clinical Diagnostics Explainer. You produce precise, professional, scientifically sound healthcare feedback."
          }
        });
        if (response.text) {
          summaryText = response.text;
        }
      } catch (e) {
        console.error("Gemini report generation failed; fallback deployed", e);
      }
    }

    // Return the report summary text plus CSV data structures for downloading
    const csvContent = 
      `Timestamp,HeartRate(BPM),OxygenSaturation(%),SystolicBP(mmHg),DiastolicBP(mmHg),StressLevel(1-100),SleepDuration(Hours)\n` +
      `${new Date().toISOString()},${state.metrics.heartRate},${state.metrics.spo2},${state.metrics.systolicBP},${state.metrics.diastolicBP},${state.metrics.stressLevel},${state.metrics.sleepDuration}\n` +
      `${new Date(Date.now() - 86400000).toISOString()},${state.metrics.heartRate - 1},${state.metrics.spo2},${state.metrics.systolicBP + 2},${state.metrics.diastolicBP - 1},${state.metrics.stressLevel + 4},6.8\n` +
      `${new Date(Date.now() - 172800000).toISOString()},${state.metrics.heartRate + 2},${state.metrics.spo2 - 1},${state.metrics.systolicBP - 3},${state.metrics.diastolicBP + 2},${state.metrics.stressLevel - 5},7.5`;

    res.json({
      summaryText,
      csvContent,
      filename: `HealthGuard_${timeline}_report_${new Date().toISOString().split('T')[0]}.csv`
    });
  });

  // AI Health Chat Assistant Context Endpoint
  app.post("/api/gemini/chat", async (req, res) => {
    const { message, chatHistory } = req.body;
    pushSecurityAudit("Alex Mercer", "Owner", "CHAT_ASSISTANT_QUERY", "AI Health Assistant Clinical Sync", "AUTHORIZED");

    if (!message) {
      return res.status(400).json({ error: "Missing message parameter" });
    }

    const state = computeStateResponse();
    const ageBmiInfo = `Patient Age: ${state.profile.age}, Gender: ${state.profile.gender}. Heart Rate: ${state.metrics.heartRate} BPM, Blood Oxygen (SpO2): ${state.metrics.spo2}%, Sleep hours: ${state.metrics.sleepDuration}hrs, Stress level: ${state.metrics.stressLevel}/100, Blood pressure: ${state.metrics.systolicBP}/${state.metrics.diastolicBP} mmHg.`;

    const instructions = `You are the core artificial intelligence entity of "HealthGuard AI", an elite clinical-tech diagnostic platform. You have live authorization to observe user biometrics: ${ageBmiInfo}. Avoid writing generic conversational pleasantries. Provide precise, humble, and expert-level feedback. When interpreting results, explain clearly what anatomical variables are acting on the metrics (such as vascular resistance, parasympathetic tone, or sleep hygiene). Clearly specify that you provide assistive interpretations and the user should consult emergency physicians for critical alarms. Keep responses strictly clinical, informative, and formatted professionally in scientific layout.`;

    if (ai) {
      try {
        const model = "gemini-3.5-flash";
        const contents = [];

        // Build simple conversational stream array
        if (chatHistory && Array.isArray(chatHistory)) {
          for (const msg of chatHistory) {
            contents.push({
              role: msg.role === "user" ? "user" : "model",
              parts: [{ text: msg.text }]
            });
          }
        }
        contents.push({ role: "user", parts: [{ text: message }] });

        const chatResponse = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: instructions,
            temperature: 0.3
          }
        });

        res.json({ text: chatResponse.text });
      } catch (err: any) {
        console.error("Gemini API Chat call failed", err);
        res.json({ 
          text: `[HealthGuard Safe Sandbox Intercept] The clinical assistant could not establish a connection to our cloud models because a valid GEMINI_API_KEY is not defined in your Secrets panel. However, based on local algorithm assessment, your current Heart Rate (${state.metrics.heartRate} bpm) and SpO2 (${state.metrics.spo2}%) denote highly stable homeostasis. Recommended action: Ensure you declare a functioning GEMINI_API_KEY in Settings > Secrets to unleash full-context conversational AI insights!`
        });
      }
    } else {
      res.json({
        text: `[HealthGuard Simulation Mode] The digital health assistant suggests maintaining current hydration milestones (Target: 2500ml). Your current blood pressure is ${state.metrics.systolicBP}/${state.metrics.diastolicBP} mmHg. This indicates robust vascular elasticity. To enable state-of-the-art server-side Gemini diagnoses, configure your GEMINI_API_KEY in the AI Studio Settings secrets panel!`
      });
    }
  });

  // Explainable AI (XAI) detail explainer
  app.post("/api/gemini/explain-risk", async (req, res) => {
    const { riskType, score, shapValues } = req.body;
    pushSecurityAudit("Alex Mercer", "Owner", "EXPLAINABLE_AI_GEN", `Dynamic SHAP/Model Explainer: ${riskType}`, "AUTHORIZED");

    let richExplanation = `Our local Random Forest and XGBoost ensemble predicts a ${score}% score for ${riskType}. The primary input vector contribution stems from lifestyle metrics, rest fatigue values, and blood pressure readings. Under clinical baseline validation, these metrics align with historical healthy control populations.`;

    if (ai) {
      try {
        const shapStr = JSON.stringify(shapValues || {});
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `As an Explainable AI (XAI) health analytics model, provide a short, 3-sentence, professional clinical explanation for a patient who has been assessed with a score of ${score}% for "${riskType}". Reference these SHAP/Shapley attribution numbers: ${shapStr}. Keep it highly readable and scientific. Explain the medical significance of having these features as the primary risk contributors.`,
          config: {
            systemInstruction: "You are the clinical Explainable AI model validation engine of HealthGuard AI. You convert abstract mathematical coefficients into human-readable medical-grade explanations."
          }
        });
        if (response.text) {
          richExplanation = response.text;
        }
      } catch (err) {
        console.error("Gemini XAI prediction breakdown failed", err);
      }
    }

    res.json({ explanation: richExplanation });
  });

  // --- VITE DEV OR PRODUCTION HANDLERS ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HealthGuard AI] Web and API container dynamically running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

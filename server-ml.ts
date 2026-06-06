import { 
  HealthMetrics, 
  RiskAnalysis, 
  MLModelType, 
  MLModelPerformance, 
  AnomalyReport,
  ForecastData,
  UserProfile
} from "./src/types";

// Static performance benchmarks for each model (representing typical Scikit-Learn/TensorFlow metrics)
export const MODEL_BENCHMARKS: { [key in MLModelType]: MLModelPerformance } = {
  [MLModelType.LOGISTIC_REGRESSION]: {
    accuracy: 0.82,
    precision: 0.80,
    recall: 0.78,
    f1Score: 0.79,
    rocAuc: 0.84
  },
  [MLModelType.RANDOM_FOREST]: {
    accuracy: 0.89,
    precision: 0.87,
    recall: 0.86,
    f1Score: 0.86,
    rocAuc: 0.92
  },
  [MLModelType.XGBOOST]: {
    accuracy: 0.94,
    precision: 0.93,
    recall: 0.91,
    f1Score: 0.92,
    rocAuc: 0.97
  },
  [MLModelType.NEURAL_NETWORK]: {
    accuracy: 0.96,
    precision: 0.95,
    recall: 0.94,
    f1Score: 0.94,
    rocAuc: 0.98
  }
};

/**
 * Calculates simulated SHAP values (feature importance) for risk metrics
 */
function calculateSHAP(
  features: { [key: string]: number },
  weights: { [key: string]: number }
): { [key: string]: number } {
  const shap: { [key: string]: number } = {};
  let totalShift = 0;

  for (const [key, val] of Object.entries(features)) {
    const rawContribution = val * (weights[key] || 0);
    shap[key] = Math.round(rawContribution * 10) / 10;
    totalShift += rawContribution;
  }
  return shap;
}

/**
 * Executes server-side predictions representing modern ML architectures
 */
export function predictHealthRisks(
  metrics: HealthMetrics,
  profile: UserProfile,
  activeModel: MLModelType,
  factors: { saltIntake: number; fitnessHours: number; alcoholUsage: number } = { saltIntake: 5, fitnessHours: 3, alcoholUsage: 1 }
): RiskAnalysis[] {
  const modelBoost = activeModel === MLModelType.NEURAL_NETWORK ? 1.02 : 
                     activeModel === MLModelType.XGBOOST ? 1.00 : 
                     activeModel === MLModelType.RANDOM_FOREST ? 0.95 : 0.88;

  const results: RiskAnalysis[] = [];

  // 1. Cardiovascular Risk Calculation
  // Derived from systolic BP, BMI, resting hr, age, fitness, alcohol level, family history
  const bmi = profile.weight / Math.pow(profile.height / 100, 2);
  const cvFeatures = {
    systolicBP: (metrics.systolicBP - 120) / 20,
    bmi: (bmi - 22) / 5,
    restingHR: (metrics.heartRate - 70) / 15,
    age: (profile.age - 35) / 15,
    fitness: -(factors.fitnessHours - 4) / 4,
    alcohol: (factors.alcoholUsage) / 2,
    familyHistory: profile.familyHistory.cardiovascular ? 1.2 : 0
  };

  const cvWeights = {
    systolicBP: 15,
    bmi: 10,
    restingHR: 8,
    age: 12,
    fitness: 14,
    alcohol: 6,
    familyHistory: 15
  };

  const cvRawScore = 20 + 
    (cvFeatures.systolicBP * cvWeights.systolicBP) + 
    (cvFeatures.bmi * cvWeights.bmi) + 
    (cvFeatures.restingHR * cvWeights.restingHR) + 
    (cvFeatures.age * cvWeights.age) + 
    (cvFeatures.fitness * cvWeights.fitness) + 
    (cvFeatures.alcohol * cvWeights.alcohol) + 
    (cvFeatures.familyHistory * cvWeights.familyHistory);

  const cvScore = Math.max(5, Math.min(98, Math.round(cvRawScore * modelBoost)));
  results.push({
    riskType: "Cardiovascular Risk",
    riskScore: cvScore,
    confidence: Math.round((MODEL_BENCHMARKS[activeModel].rocAuc - 0.05 + Math.random() * 0.1) * 100) / 100,
    explanation: cvScore > 65 
      ? "Elevated threat linked directly to high arterial stiffness (systolic BP), elevated body mass, and positive family records."
      : cvScore > 35 
      ? "Moderate warning metrics. Controlled physical workouts and sodium intake will optimize arterial walls flexibility."
      : "Optimized cardiovascular state. Standard monitoring is advised.",
    shapValues: calculateSHAP(cvFeatures, cvWeights)
  });

  // 2. Hypertension Risk Calculation
  const hyperFeatures = {
    saltIntake: (factors.saltIntake - 4) / 2,
    systolicBP: (metrics.systolicBP - 110) / 15,
    diastolicBP: (metrics.diastolicBP - 70) / 10,
    age: (profile.age - 30) / 20,
    stressLevel: (metrics.stressLevel - 40) / 20,
    familyHistory: profile.familyHistory.hypertension ? 1.5 : 0
  };

  const hyperWeights = {
    saltIntake: 20,
    systolicBP: 18,
    diastolicBP: 12,
    age: 8,
    stressLevel: 10,
    familyHistory: 14
  };

  const hyperRawScore = 15 + 
    (hyperFeatures.saltIntake * hyperWeights.saltIntake) + 
    (hyperFeatures.systolicBP * hyperWeights.systolicBP) + 
    (hyperFeatures.diastolicBP * hyperWeights.diastolicBP) + 
    (hyperFeatures.age * hyperWeights.age) + 
    (hyperFeatures.stressLevel * hyperWeights.stressLevel) + 
    (hyperFeatures.familyHistory * hyperWeights.familyHistory);

  const hyperScore = Math.max(4, Math.min(99, Math.round(hyperRawScore * modelBoost)));
  results.push({
    riskType: "Arterial Hypertension Risk",
    riskScore: hyperScore,
    confidence: Math.round((MODEL_BENCHMARKS[activeModel].rocAuc - 0.07 + Math.random() * 0.1) * 100) / 100,
    explanation: hyperScore > 70
      ? "Dangerous threshold of arterial occlusion risk. Immediate salt reduction (<2g daily) and medical support highly recommended."
      : hyperScore > 40
      ? "Mild metabolic risk. Stress levels and dynamic heavy breathing drills help return arterial state to target zone."
      : "Optimal, smooth blood volume dynamics with stable vascular resistance.",
    shapValues: calculateSHAP(hyperFeatures, hyperWeights)
  });

  // 3. Stress & Fatigue Risk
  const fatigueFeatures = {
    sleepDeficit: (7.5 - metrics.sleepDuration) / 2,
    stressLevel: (metrics.stressLevel - 50) / 20,
    hrv: -(metrics.hrv - 60) / 20,
    steps: -(metrics.steps - 8000) / 4000
  };

  const fatigueWeights = {
    sleepDeficit: 22,
    stressLevel: 18,
    hrv: 15,
    steps: 10
  };

  const fatigueRaw = 25 + 
    (fatigueFeatures.sleepDeficit * fatigueWeights.sleepDeficit) + 
    (fatigueFeatures.stressLevel * fatigueWeights.stressLevel) + 
    (fatigueFeatures.hrv * fatigueWeights.hrv) + 
    (fatigueFeatures.steps * fatigueWeights.steps);

  const fatigueScore = Math.max(5, Math.min(95, Math.round(fatigueRaw * modelBoost)));
  results.push({
    riskType: "Stress & Fatigue Vulnerability",
    riskScore: fatigueScore,
    confidence: Math.round((MODEL_BENCHMARKS[activeModel].rocAuc - 0.04 + Math.random() * 0.08) * 100) / 100,
    explanation: fatigueScore > 60
      ? "Fatigue system warns of elevated adrenal fatigue. Sleep consistency is poor and HRV shows hyper-sympathetic activation."
      : "Low-to-moderate neurological load. High neurological recovery markers detected.",
    shapValues: calculateSHAP(fatigueFeatures, fatigueWeights)
  });

  // 4. Sedentary Lifestyle Risk
  const sedentaryFeatures = {
    stepsDeficit: (10000 - metrics.steps) / 2000,
    caloriesBurned: -(metrics.caloriesBurned - 2200) / 400,
    fitnessHours: -(factors.fitnessHours - 3) / 2
  };

  const sedentaryWeights = {
    stepsDeficit: 25,
    caloriesBurned: 15,
    fitnessHours: 20
  };

  const sedentaryRaw = 30 + 
    (sedentaryFeatures.stepsDeficit * sedentaryWeights.stepsDeficit) + 
    (sedentaryFeatures.caloriesBurned * sedentaryWeights.caloriesBurned) + 
    (sedentaryFeatures.fitnessHours * sedentaryWeights.fitnessHours);

  const sedentaryScore = Math.max(5, Math.min(99, Math.round(sedentaryRaw * modelBoost)));
  results.push({
    riskType: "Sedentary Chronicity Factor",
    riskScore: sedentaryScore,
    confidence: Math.round((MODEL_BENCHMARKS[activeModel].rocAuc - 0.02) * 100) / 100,
    explanation: sedentaryScore > 50
      ? "Vascular and musculoskeletal indicators emphasize extended stationary hours. Stand every 45 mins to optimize vascular tree circulation."
      : "Excellent metabolic activity levels. Keeps peripheral blood flow optimized.",
    shapValues: calculateSHAP(sedentaryFeatures, sedentaryWeights)
  });

  return results;
}

/**
 * Anomaly Detection Engine (Simulating an Isolation Forest clustering outlier detector)
 */
export function runAnomalyDetection(metrics: HealthMetrics): AnomalyReport[] {
  const alerts: AnomalyReport[] = [];
  const makeId = () => Math.random().toString(36).substr(2, 9).toUpperCase();

  // 1. Tachycardia / Arrhythmia check
  if (metrics.heartRate > 120) {
    alerts.push({
      id: "HR_" + makeId(),
      timestamp: new Date().toISOString(),
      metric: "Heart Rate",
      value: metrics.heartRate,
      threshold: "> 120 BPM",
      severity: "critical",
      status: "active"
    });
  } else if (metrics.heartRate < 45) {
    alerts.push({
      id: "HR_" + makeId(),
      timestamp: new Date().toISOString(),
      metric: "Bradycardia Warning",
      value: metrics.heartRate,
      threshold: "< 45 BPM",
      severity: "warning",
      status: "active"
    });
  }

  // 2. Hypoxia (SpO2 drop) check - highly critical
  if (metrics.spo2 < 92) {
    alerts.push({
      id: "SPO2_" + makeId(),
      timestamp: new Date().toISOString(),
      metric: "Blood Oxygen (SpO2)",
      value: metrics.spo2,
      threshold: "< 92%",
      severity: "critical",
      status: "active"
    });
  } else if (metrics.spo2 < 95) {
    alerts.push({
      id: "SPO2_" + makeId(),
      timestamp: new Date().toISOString(),
      metric: "Mild Desaturation",
      value: metrics.spo2,
      threshold: "< 95%",
      severity: "warning",
      status: "active"
    });
  }

  // 3. Hyperthermia/Fever Check
  if (metrics.bodyTemp > 38.5) {
    alerts.push({
      id: "TEMP_" + makeId(),
      timestamp: new Date().toISOString(),
      metric: "Internal Body Temp",
      value: metrics.bodyTemp,
      threshold: "> 38.5°C",
      severity: "critical",
      status: "active"
    });
  }

  // 4. Extreme Stress Outlying Activity
  if (metrics.stressLevel > 85) {
    alerts.push({
      id: "STRESS_" + makeId(),
      timestamp: new Date().toISOString(),
      metric: "Adrenocortical Peak",
      value: metrics.stressLevel,
      threshold: "> 85 (Elevated)",
      severity: "warning",
      status: "active"
    });
  }

  return alerts;
}

/**
 * 30-90 Day Time Series Forecasting Engine (Simulating an Autoregressive/LSTM time series model)
 */
export function generateHealthForecast(
  metrics: HealthMetrics,
  days: number = 30
): ForecastData[] {
  const forecast: ForecastData[] = [];
  const baseHR = metrics.heartRate;
  const baseStress = metrics.stressLevel;
  const baseSleep = metrics.sleepDuration;

  for (let i = 1; i <= days; i++) {
    // Adding sinusoidal and random walks simulating organic bodily adaptation
    const sineFactor = Math.sin((i / days) * Math.PI * 2);
    const noise = (Math.random() - 0.5) * 4;

    forecast.push({
      day: `Day ${i}`,
      predictedHeartRate: Math.round(baseHR + (sineFactor * 3) + noise),
      predictedSleepQuality: Math.max(40, Math.min(100, Math.round(75 + (sineFactor * 10) + (Math.random() - 0.5) * 6))),
      predictedStressLevel: Math.max(10, Math.min(100, Math.round(baseStress - (sineFactor * i * 0.2) + (Math.random() - 0.5) * 8))),
      historicalActivity: Math.round(metrics.steps + (sineFactor * 1500) + (Math.random() - 0.5) * 1000)
    });
  }

  return forecast;
}

export enum WearableBrand {
  FITBIT = "Fitbit Charge 6",
  APPLE = "Apple Watch Ultra 2",
  SAMSUNG = "Galaxy Watch 6 Pro",
  GARMIN = "Garmin Fenix 7 Pro"
}

export enum MLModelType {
  LOGISTIC_REGRESSION = "Logistic Regression",
  RANDOM_FOREST = "Random Forest",
  XGBOOST = "XGBoost",
  NEURAL_NETWORK = "Deep Neural Network"
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  weight: number; // kg
  height: number; // cm
  bloodType: string;
  avatar: string;
  familyHistory: {
    cardiovascular: boolean;
    diabetes: boolean;
    hypertension: boolean;
  };
}

export interface HealthMetrics {
  heartRate: number; // bpm
  spo2: number; // %
  bodyTemp: number; // °C
  sleepDuration: number; // hours
  stressLevel: number; // 1-100
  steps: number;
  caloriesBurned: number;
  waterIntake: number; // ml
  systolicBP: number; // mmHg
  diastolicBP: number; // mmHg
  respiratoryRate: number; // breaths/min
  hrv: number; // ms (Heart Rate Variability)
}

export interface SimConfig {
  anomaliesEnabled: boolean;
  heartRateAnomalyRatio: number; // multiplier
  spo2AnomalyRatio: number; // multiplier
  stressMultiplier: number;
  activeModel: MLModelType;
}

export interface MLModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
}

export interface RiskAnalysis {
  riskType: string;
  riskScore: number; // 0 to 100
  confidence: number; // 0 to 1
  explanation: string;
  shapValues: { [feature: string]: number }; // SHAP feature contributions
}

export interface AnomalyReport {
  id: string;
  timestamp: string;
  metric: string;
  value: number;
  threshold: string;
  severity: "critical" | "warning";
  status: "active" | "resolved" | "contacted";
}

export interface Habit {
  id: string;
  title: string;
  category: "fitness" | "hydration" | "sleep" | "stress";
  cue: string;
  frequency: string;
  streak: number;
  completedToday: boolean;
}

export interface HIPAAAuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  resource: string;
  status: "AUTHORIZED" | "GRANTED" | "SUSPICIOUS";
}

export interface FamilyProfile {
  id: string;
  name: string;
  relation: string;
  age: number;
  status: "stable" | "warning" | "critical";
  lastActive: string;
  metrics: Partial<HealthMetrics>;
}

export interface ForecastData {
  day: string;
  predictedHeartRate: number;
  predictedSleepQuality: number;
  predictedStressLevel: number;
  historicalActivity: number;
}

export interface StateResponse {
  profile: UserProfile;
  metrics: HealthMetrics;
  simConfig: SimConfig;
  modelsPerformance: { [key in MLModelType]: MLModelPerformance };
  risks: RiskAnalysis[];
  anomalies: AnomalyReport[];
  habits: Habit[];
  auditLogs: HIPAAAuditLog[];
  family: FamilyProfile[];
  wearable: {
    connected: boolean;
    brand: WearableBrand;
    battery: number;
    syncTime: string;
  };
}

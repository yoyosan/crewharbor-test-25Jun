export type ProcessPoint = {
  time: Date;
  value: number;
  metric: string;
};

export type ThresholdConfig = {
  min: number;
  max: number;
  warning: number;
};

export type MetricConfig = {
  name: string;
  unit: string;
  thresholds: ThresholdConfig;
  color: string;
};

export const METRICS: MetricConfig[] = [
  {
    name: "Bath Temperature",
    unit: "°C",
    thresholds: { min: 20, max: 60, warning: 50 },
    color: "#3b82f6",
  },
  {
    name: "Current Density",
    unit: "A/dm²",
    thresholds: { min: 0, max: 10, warning: 7 },
    color: "#10b981",
  },
  {
    name: "pH Level",
    unit: "pH",
    thresholds: { min: 0, max: 14, warning: 10 },
    color: "#f59e0b",
  },
  {
    name: "Plating Thickness",
    unit: "μm",
    thresholds: { min: 0, max: 25, warning: 20 },
    color: "#ca44f4",
  },
];

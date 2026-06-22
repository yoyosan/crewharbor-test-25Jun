<script setup lang="ts">
import { computed } from "vue";
import type { MetricConfig } from "@src/types/processData";

const props = defineProps<{
  metrics: MetricConfig[];
  currentValues: Record<string, number>;
}>();

interface Insight {
  type: "warning" | "info" | "success";
  icon: string;
  message: string;
  time: string;
}

const insights = computed<Insight[]>(() => {
  const result: Insight[] = [];
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  for (const metric of props.metrics) {
    const value = props.currentValues[metric.name];
    if (value === undefined) {
      continue;
    }

    const ratio = (value - metric.thresholds.min) / (metric.thresholds.max - metric.thresholds.min);

    if (value > metric.thresholds.warning) {
      result.push({
        type: "warning",
        icon: "⚠️",
        message: `${metric.name} exceeded warning threshold (${metric.thresholds.warning} ${metric.unit}). Current value: ${value.toFixed(1)} ${metric.unit}`,
        time: timeStr,
      });
    } else if (ratio > 0.6) {
      result.push({
        type: "info",
        icon: "📊",
        message: `${metric.name} is approaching warning zone. Close monitoring recommended.`,
        time: timeStr,
      });
    } else if (ratio < 0.2) {
      result.push({
        type: "info",
        icon: "📉",
        message: `${metric.name} is low (${value.toFixed(1)} ${metric.unit}). Check supply settings.`,
        time: timeStr,
      });
    } else {
      result.push({
        type: "success",
        icon: "✅",
        message: `${metric.name} is within normal parameters (${value.toFixed(1)} ${metric.unit})`,
        time: timeStr,
      });
    }
  }

  // Process-level insights
  const allBelowWarning = props.metrics.every((m) => {
    const v = props.currentValues[m.name];
    return v !== undefined && v <= m.thresholds.warning;
  });

  if (allBelowWarning) {
    result.push({
      type: "success",
      icon: "🏭",
      message: "All parameters are within acceptable limits. Electroplating process is running normally.",
      time: timeStr,
    });
  } else {
    const warningMetrics = props.metrics
      .filter((m) => props.currentValues[m.name] !== undefined && props.currentValues[m.name] > m.thresholds.warning)
      .map((m) => m.name);

    result.push({
      type: "warning",
      icon: "🔧",
      message: `Recommended intervention: ${warningMetrics.join(", ")}. Check process settings.`,
      time: timeStr,
    });
  }

  return result;
});

const typeStyles: Record<string, { bg: string; border: string }> = {
  warning: { bg: "rgba(239, 68, 68, 0.1)", border: "rgba(239, 68, 68, 0.3)" },
  info: { bg: "rgba(59, 130, 246, 0.1)", border: "rgba(59, 130, 246, 0.3)" },
  success: { bg: "rgba(34, 197, 94, 0.1)", border: "rgba(34, 197, 94, 0.3)" },
};
</script>

<template>
  <div class="insight-panel">
    <div class="panel-header">
      <h3>🤖 AI Process Insights</h3>
      <span class="badge">Live</span>
    </div>
    <div class="insights-list">
      <div
        v-for="(insight, index) in insights"
        :key="index"
        class="insight-item"
        :style="{
          background: typeStyles[insight.type].bg,
          borderColor: typeStyles[insight.type].border,
        }"
      >
        <span class="insight-icon">{{ insight.icon }}</span>
        <div class="insight-content">
          <p class="insight-message">{{ insight.message }}</p>
          <span class="insight-time">{{ insight.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.insight-panel {
  background: #1f2937;
  border-radius: 12px;
  padding: 16px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.panel-header h3 {
  margin: 0;
  font-size: 14px;
  color: #e5e7eb;
  font-weight: 500;
}

.badge {
  font-size: 11px;
  padding: 2px 8px;
  background: #064e3b;
  color: #34d399;
  border-radius: 10px;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.insight-item {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid;
}

.insight-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.insight-content {
  flex: 1;
}

.insight-message {
  margin: 0;
  font-size: 13px;
  color: #e5e7eb;
  line-height: 1.4;
}

.insight-time {
  font-size: 11px;
  color: #6b7280;
}
</style>

<script setup lang="ts">
import type { MetricConfig } from '@src/types/processData'

defineProps<{
  metrics: MetricConfig[]
  currentValues: Record<string, number>
}>()
</script>

<template>
  <div class="metrics-bar">
    <div v-for="metric in metrics" :key="metric.name" class="metric-card">
      <span class="metric-label">{{ metric.name }}</span>
      <span class="metric-value" :style="{ color: metric.color }">
        {{ currentValues[metric.name]?.toFixed(1) ?? '—' }}
      </span>
      <span class="metric-unit">{{ metric.unit }}</span>
    </div>
  </div>
</template>

<style scoped>
.metrics-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  background: #1f2937;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.metric-label {
  display: block;
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.metric-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.metric-unit {
  display: block;
  font-size: 11px;
  color: #6b7280;
  margin-top: 2px;
}
</style>

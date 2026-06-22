<script setup lang="ts">
import { useProcessData } from "@src/composables/useProcessData";
import { METRICS } from "@src/types/processData";
import LineChart from "@src/components/dashboard/LineChart.vue";
import GaugeChart from "@src/components/dashboard/GaugeChart.vue";
import BarChart from "@src/components/dashboard/BarChart.vue";
import BathVisualization3D from "@src/components/dashboard/BathVisualization3D.vue";
import InsightPanel from "@src/components/dashboard/InsightPanel.vue";
import MetricsBar from "@src/components/dashboard/MetricsBar.vue";
import WegZeitDiagram from "@src/components/dashboard/WegZeitDiagram.vue";
import { computed, watch } from "vue";
import { useLiveState } from "@src/composables/useLiveState";

const { isLive } = useLiveState();
const { getMetricData, getCurrentValue, start, stop } = useProcessData();

watch(isLive, (live) => {
  live ? start() : stop();
});

const temperatureData = getMetricData("Bath Temperature");
const currentDensityData = getMetricData("Current Density");
const thicknessData = getMetricData("Plating Thickness");

const currentDensityValue = getCurrentValue("Current Density");
const phValue = getCurrentValue("pH Level");
const temperatureValue = getCurrentValue("Bath Temperature");
const thicknessValue = getCurrentValue("Plating Thickness");

const currentValues = computed(() => ({
  "Bath Temperature": temperatureValue.value,
  "Current Density": currentDensityValue.value,
  "pH Level": phValue.value,
  "Plating Thickness": thicknessValue.value,
}));
</script>

<template>
  <div>
    <div class="full-width section">
      <WegZeitDiagram />
    </div>

    <MetricsBar :metrics="METRICS" :current-values="currentValues" />

    <div class="charts-grid section">
      <div class="chart-cell main-chart">
        <LineChart :data="temperatureData" :metric="METRICS[0]" />
      </div>

      <div class="chart-cell">
        <BathVisualization3D :temperature="temperatureValue" />
      </div>

      <div class="chart-cell">
        <LineChart :data="currentDensityData" :metric="METRICS[1]" />
      </div>

      <div class="chart-cell">
        <BarChart :data="thicknessData" :metric="METRICS[3]" />
      </div>

      <div class="chart-cell">
        <GaugeChart :value="currentDensityValue" :metric="METRICS[1]" />
      </div>
      <div class="chart-cell">
        <GaugeChart :value="phValue" :metric="METRICS[2]" />
      </div>
    </div>

    <div class="full-width section">
      <InsightPanel :metrics="METRICS" :current-values="currentValues" />
    </div>
  </div>
</template>

<style scoped>
.section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #374151;
}

.section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.chart-cell {
  min-height: 200px;
  overflow: hidden;
}

.main-chart {
  grid-column: 1;
}

.full-width {
  grid-column: 1 / -1;
}

@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .section {
    margin-bottom: 16px;
    padding-bottom: 16px;
  }
}
</style>

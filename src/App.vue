<script setup lang="ts">
import { useProcessData } from "@src/composables/useProcessData";
import { METRICS } from "@src/types/processData";
import LineChart from "@src/components/LineChart.vue";
import GaugeChart from "@src/components/GaugeChart.vue";
import BarChart from "@src/components/BarChart.vue";
import BathVisualization3D from "@src/components/BathVisualization3D.vue";
import InsightPanel from "@src/components/InsightPanel.vue";
import DashboardHeader from "@src/components/DashboardHeader.vue";
import MetricsBar from "@src/components/MetricsBar.vue";
import DashboardFooter from "@src/components/DashboardFooter.vue";
import WegZeitDiagram from "@src/components/WegZeitDiagram.vue";
import { computed, ref } from "vue";

const isLive = ref(true);
const { getMetricData, getCurrentValue, start, stop } = useProcessData();

const toggleLive = () => {
  isLive.value = !isLive.value;
  isLive.value ? start() : stop();
};

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
  <div class="dashboard">
    <DashboardHeader :is-live="isLive" @toggle="toggleLive" />

    <div class="full-width dashboard-insight">
      <WegZeitDiagram />
    </div>

    <MetricsBar :metrics="METRICS" :current-values="currentValues" />

    <div class="charts-grid">
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

    <div class="full-width dashboard-insight">
      <InsightPanel :metrics="METRICS" :current-values="currentValues" />
    </div>

    <DashboardFooter />
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #111827;
  color: #e5e7eb;
  padding: 24px;
  box-sizing: border-box;
}

.dashboard-insight {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #374151;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.chart-cell {
  min-height: 300px;
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
</style>

<script setup lang="ts">
import { onMounted, onUnmounted, watch, nextTick, computed, useTemplateRef } from "vue";
import * as d3 from "d3";
import type { MetricConfig } from "@src/types/processData";

const props = defineProps<{
  value: number;
  metric: MetricConfig;
}>();

const chartRef = useTemplateRef("chart");

const statusColor = computed(() => {
  const ratio =
    (props.value - props.metric.thresholds.min) / (props.metric.thresholds.max - props.metric.thresholds.min);

  if (ratio > 0.8) {
    return "#ef4444";
  }
  if (ratio > 0.6) {
    return "#f59e0b";
  }

  return props.metric.color;
});

const width = 200;
const height = 150;
const radius = 80;

let svg: d3.Selection<SVGGElement, unknown, null, undefined>;
let valueArcPath: d3.Selection<SVGPathElement, unknown, null, undefined>;
let needle: d3.Selection<SVGLineElement, unknown, null, undefined>;
let valueText: d3.Selection<SVGTextElement, unknown, null, undefined>;

const scale = d3
  .scaleLinear()
  .domain([props.metric.thresholds.min, props.metric.thresholds.max])
  .range([-Math.PI / 2, Math.PI / 2]);

const initChart = () => {
  if (!chartRef.value) {
    return;
  }

  d3.select(chartRef.value).selectAll("*").remove();

  svg = d3
    .select(chartRef.value)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height - 20})`);

  // background arc (full range, gray)
  const backgroundArc = d3
    .arc<unknown, unknown>()
    .innerRadius(radius - 15)
    .outerRadius(radius)
    .startAngle(-Math.PI / 2)
    .endAngle(Math.PI / 2);

  svg.append("path").attr("d", backgroundArc(null)).attr("fill", "#374151");

  // warning arc (warning to max, red tint)
  const warningArc = d3
    .arc<unknown, unknown>()
    .innerRadius(radius - 15)
    .outerRadius(radius)
    .startAngle(scale(props.metric.thresholds.warning))
    .endAngle(Math.PI / 2);

  svg.append("path").attr("d", warningArc(null)).attr("fill", "#ef4444").attr("opacity", 0.3);

  // value arc (updated)
  valueArcPath = svg.append("path").attr("fill", statusColor.value);

  // Needle (updated)
  needle = svg.append("line").attr("stroke", "#fff").attr("stroke-width", 2).attr("stroke-linecap", "round");

  // Center circle (static)
  svg.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 5).attr("fill", "#fff");

  // Value text (updated)
  valueText = svg
    .append("text")
    .attr("x", 0)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .attr("fill", "#e5e7eb")
    .attr("font-size", "24px")
    .attr("font-weight", "bold");

  // Unit text (static)
  svg
    .append("text")
    .attr("x", 0)
    .attr("y", -5)
    .attr("text-anchor", "middle")
    .attr("fill", "#9ca3af")
    .attr("font-size", "12px")
    .text(props.metric.unit);
};

const updateChart = () => {
  if (!svg) {
    return;
  }

  const needleLength = radius - 25;
  const needleAngle = scale(props.value);

  // Update value arc
  const valueArc = d3.arc<unknown, unknown>().innerRadius(radius - 15).outerRadius(radius).startAngle(-Math.PI / 2);

  const node = valueArcPath.node() as (SVGPathElement & { __currentAngle?: number }) | null;
  const previousAngle = node?.__currentAngle ?? -Math.PI / 2;
  const targetAngle = scale(props.value);
  const interpolateAngle = d3.interpolate(previousAngle, targetAngle);

  valueArcPath
    .transition()
    .duration(300)
    .attrTween("d", () => (t: number) => {
      const angle = interpolateAngle(t);
      if (node) node.__currentAngle = angle;
      return valueArc.endAngle(angle)(null) ?? "";
    })
    .attr("fill", statusColor.value);

  // Update needle
  needle
    .transition()
    .duration(300)
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", Math.cos(needleAngle - Math.PI / 2) * needleLength)
    .attr("y2", Math.sin(needleAngle - Math.PI / 2) * needleLength);

  // Update value text
  valueText.text(props.value.toFixed(1));
};

watch(
  () => props.value,
  () => {
    nextTick(updateChart);
  },
);

let resizeTimer: number;

const handleResize = () => {
  clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    if (!chartRef.value) return;
    d3.select(chartRef.value).selectAll("*").remove();
    initChart();
    updateChart();
  }, 200);
};

onMounted(() => {
  nextTick(() => {
    initChart();
    updateChart();
    window.addEventListener("resize", handleResize);
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <div class="gauge-chart">
    <h3>{{ metric.name }}</h3>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<style scoped>
.gauge-chart {
  background: #1f2937;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #e5e7eb;
  font-weight: 500;
}

.chart-container {
  display: flex;
  justify-content: center;
}
</style>

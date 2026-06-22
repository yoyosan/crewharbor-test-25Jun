<script setup lang="ts">
import type { MetricConfig, ProcessPoint } from "@src/types/processData";
import * as d3 from "d3";
import { nextTick, onMounted, onUnmounted, useTemplateRef, watch } from "vue";

const props = defineProps<{
  data: ProcessPoint[];
  metric: MetricConfig;
}>();

const chartRef = useTemplateRef("chart");

let svg: d3.Selection<SVGGElement, unknown, null, undefined>;
let xScale: d3.ScaleTime<number, number>;
let yScale: d3.ScaleLinear<number, number>;
let linePath: d3.Selection<SVGPathElement, unknown, null, undefined>;
let areaPath: d3.Selection<SVGPathElement, unknown, null, undefined>;
let dot: d3.Selection<SVGCircleElement, unknown, null, undefined>;
let dotLabel: d3.Selection<SVGTextElement, unknown, null, undefined>;
let xAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
let yAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
let width = 0;
let height = 0;

const initChart = () => {
  if (!chartRef.value || !props.data.length) {
    return;
  }

  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  width = chartRef.value.clientWidth - margin.left - margin.right;
  height = 250 - margin.top - margin.bottom;

  svg = d3
    .select(chartRef.value)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // scales
  xScale = d3
    .scaleTime()
    .domain(d3.extent(props.data, (d) => d.time) as [Date, Date])
    .range([0, width]);

  yScale = d3.scaleLinear().domain([props.metric.thresholds.min, props.metric.thresholds.max]).range([height, 0]);

  // warning threshold line
  svg
    .append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", yScale(props.metric.thresholds.warning))
    .attr("y2", yScale(props.metric.thresholds.warning))
    .attr("stroke", "#ef4444")
    .attr("stroke-dasharray", "4")
    .attr("opacity", 0.7);

  // warning label
  svg
    .append("text")
    .attr("x", width - 5)
    .attr("y", yScale(props.metric.thresholds.warning))
    .attr("text-anchor", "end")
    .attr("fill", "#ef4444")
    .attr("font-size", "10px")
    .text("warning");

  // gradient for area
  const defs = svg.append("defs");
  const gradientId = `gradient-${props.metric.name.replace(/\s+/g, "-")}`;
  const gradient = defs
    .append("linearGradient")
    .attr("id", gradientId)
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  gradient.append("stop").attr("offset", "0%").attr("stop-color", props.metric.color).attr("stop-opacity", 0.3);

  gradient.append("stop").attr("offset", "100%").attr("stop-color", props.metric.color).attr("stop-opacity", 0.05);

  // Create empty paths (updated in updateChart)
  areaPath = svg.append("path").attr("fill", `url(#${gradientId})`);

  linePath = svg.append("path").attr("fill", "none").attr("stroke", props.metric.color).attr("stroke-width", 2);

  // Create dot and label (updated in updateChart)
  dot = svg
    .append("circle")
    .attr("r", 6)
    .attr("fill", "#fff")
    .attr("stroke", props.metric.color)
    .attr("stroke-width", 3);

  dotLabel = svg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("fill", "#e5e7eb")
    .attr("font-size", "12px")
    .attr("font-weight", "bold");

  // Axes (created once, re-rendered with new domains)
  xAxisGroup = svg.append("g").attr("transform", `translate(0,${height})`);

  yAxisGroup = svg.append("g");

  // Style axes
  svg.selectAll(".domain").attr("stroke", "#374151");
  svg.selectAll(".tick line").attr("stroke", "#374151");
};

const updateChart = () => {
  if (!svg || !props.data.length) {
    return;
  }

  // Update xScale domain only
  xScale.domain(d3.extent(props.data, (d) => d.time) as [Date, Date]);

  // Update line path
  const line = d3
    .line<ProcessPoint>()
    .x((d) => xScale(d.time))
    .y((d) => yScale(d.value))
    .curve(d3.curveMonotoneX);
  linePath.datum(props.data).attr("d", line);

  // Update area path
  const area = d3
    .area<ProcessPoint>()
    .x((d) => xScale(d.time))
    .y0(height)
    .y1((d) => yScale(d.value))
    .curve(d3.curveMonotoneX);
  areaPath.datum(props.data).attr("d", area);

  // Update dot position
  const lastPoint = props.data[props.data.length - 1];
  if (lastPoint) {
    dot.attr("cx", xScale(lastPoint.time)).attr("cy", yScale(lastPoint.value));
    dotLabel
      .attr("x", xScale(lastPoint.time))
      .attr("y", yScale(lastPoint.value) - 12)
      .text(`${lastPoint.value.toFixed(1)}`);
  }

  // Re-render axes with new x domain
  xAxisGroup.call(
    d3
      .axisBottom(xScale)
      .ticks(5)
      .tickFormat(d3.timeFormat("%H:%M:%S") as (d: Date | d3.NumberValue) => string),
  );
  xAxisGroup.selectAll("text").attr("fill", "#9ca3af").attr("font-size", "10px");

  yAxisGroup.call(d3.axisLeft(yScale).ticks(5));
  yAxisGroup.selectAll("text").attr("fill", "#9ca3af").attr("font-size", "10px");
};

watch(
  () => props.data,
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
  <div class="line-chart">
    <div class="chart-header">
      <h3>{{ metric.name }}</h3>
      <span class="unit">{{ metric.unit }}</span>
    </div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<style scoped>
.line-chart {
  background: #1f2937;
  border-radius: 12px;
  padding: 16px;
  height: 100%;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.chart-header h3 {
  margin: 0;
  font-size: 14px;
  color: #e5e7eb;
  font-weight: 500;
}

.unit {
  font-size: 12px;
  color: #9ca3af;
}

.chart-container {
  width: 100%;
  height: 250px;
  overflow: hidden;
}
</style>

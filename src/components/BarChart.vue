<script setup lang="ts">
import type { MetricConfig, ProcessPoint } from "@src/types/processData";
import * as d3 from "d3";
import { computed, nextTick, onMounted, useTemplateRef, watch } from "vue";

const props = defineProps<{
  data: ProcessPoint[];
  metric: MetricConfig;
}>();

const chartRef = useTemplateRef("chart");
const bucketSize = 10_000; // 10 seconds

// aggregate raw data into 10-second buckets
const buckets = computed(() => {
  const result: { label: string; avg: number; min: number; max: number }[] = [];

  if (!props.data.length) {
    return result;
  }

  const startTime = props.data[0].time.getTime();
  const endTime = props.data[props.data.length - 1].time.getTime();

  for (let t = startTime; t <= endTime; t += bucketSize) {
    const bucketPoints = props.data.filter((p) => p.time.getTime() >= t && p.time.getTime() < t + bucketSize);
    if (bucketPoints.length > 0) {
      const values = bucketPoints.map((p) => p.value);
      result.push({
        label: d3.timeFormat("%H:%M:%S")(new Date(t)),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
      });
    }
  }

  return result.slice(-10); // last 10 buckets
});

let svg: d3.Selection<SVGGElement, unknown, null, undefined>;
let xScale: d3.ScaleBand<string>;
let yScale: d3.ScaleLinear<number, number>;
let xAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
let yAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
let width = 0;
let height = 0;

const initChart = () => {
  if (!chartRef.value || !buckets.value.length) {
    return;
  }

  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  width = chartRef.value.clientWidth - margin.left - margin.right;
  height = 250 - margin.top - margin.bottom;

  d3.select(chartRef.value).selectAll("*").remove();

  svg = d3
    .select(chartRef.value)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // scales
  xScale = d3.scaleBand().range([0, width]).padding(0.3);

  yScale = d3.scaleLinear().domain([0, props.metric.thresholds.max]).range([height, 0]);

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

  xAxisGroup = svg.append("g").attr("transform", `translate(0,${height})`);
  yAxisGroup = svg.append("g");

  // axis styling
  svg.selectAll(".domain").attr("stroke", "#374151");
  svg.selectAll(".tick line").attr("stroke", "#374151");
};

const updateChart = () => {
  if (!svg || !buckets.value.length) {
    return;
  }

  xScale.domain(buckets.value.map((d) => d.label));

  // Bars — join handles enter/update/exit seamlessly
  svg
    .selectAll<SVGRectElement, (typeof buckets.value)[number]>(".bar")
    .data(buckets.value, (d) => d.label)
    .join(
      (enter) =>
        enter
          .append("rect")
          .attr("class", "bar")
          .attr("rx", 4)
          .attr("x", (d) => xScale(d.label) || 0)
          .attr("width", xScale.bandwidth())
          .attr("y", height)
          .attr("height", 0),
      (update) => update,
      (exit) => exit.transition().duration(300).attr("y", height).attr("height", 0).remove(),
    )
    .transition()
    .duration(300)
    .attr("x", (d) => xScale(d.label) || 0)
    .attr("y", (d) => yScale(d.avg))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => height - yScale(d.avg))
    .attr("fill", (d) => (d.avg > props.metric.thresholds.warning ? "#ef4444" : props.metric.color))
    .attr("opacity", 0.8);

  // Error bars
  svg
    .selectAll<SVGLineElement, (typeof buckets.value)[number]>(".error-bar")
    .data(buckets.value, (d) => d.label)
    .join(
      (enter) =>
        enter
          .append("line")
          .attr("class", "error-bar")
          .attr("stroke", "#9ca3af")
          .attr("stroke-width", 1)
          .attr("x1", (d) => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
          .attr("x2", (d) => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
          .attr("y1", height)
          .attr("y2", height),
      (update) => update,
      (exit) => exit.transition().duration(300).attr("y1", height).attr("y2", height).remove(),
    )
    .transition()
    .duration(300)
    .attr("x1", (d) => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
    .attr("x2", (d) => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
    .attr("y1", (d) => yScale(d.max))
    .attr("y2", (d) => yScale(d.min));

  // Axes
  xAxisGroup.call(d3.axisBottom(xScale));
  xAxisGroup
    .selectAll("text")
    .attr("fill", "#9ca3af")
    .attr("font-size", "9px")
    .attr("transform", "rotate(-45)")
    .attr("text-anchor", "end");

  yAxisGroup.call(d3.axisLeft(yScale).ticks(5));
  yAxisGroup.selectAll("text").attr("fill", "#9ca3af").attr("font-size", "10px");
};

watch(
  () => props.data,
  () => {
    nextTick(updateChart);
  },
);

onMounted(() => {
  nextTick(() => {
    initChart();
    updateChart();
  });
});
</script>

<template>
  <div class="bar-chart">
    <div class="chart-header">
      <h3>{{ metric.name }} — Batches</h3>
      <span class="unit">{{ metric.unit }}</span>
    </div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<style scoped>
.bar-chart {
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
}
</style>

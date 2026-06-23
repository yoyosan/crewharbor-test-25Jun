<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, useTemplateRef } from "vue";
import * as d3 from "d3";

interface ProcessEvent {
  time: Date;
  type: "start" | "stop" | "maintenance" | "chemical" | "measurement" | "alarm";
  label: string;
  description: string;
}

const chartRef = useTemplateRef("chart");

// Simulated process events
const events = ref<ProcessEvent[]>([]);

const eventTypes: Record<string, { color: string; icon: string }> = {
  start: { color: "#3b82f6", icon: "▶" },
  stop: { color: "#ef4444", icon: "⏹" },
  maintenance: { color: "#f59e0b", icon: "🔧" },
  chemical: { color: "#8b5cf6", icon: "🧪" },
  measurement: { color: "#10b981", icon: "📏" },
  alarm: { color: "#ef4444", icon: "⚠️" },
};

const generateEvent = (): ProcessEvent => {
  const types: ProcessEvent["type"][] = ["maintenance", "chemical", "measurement", "alarm"];
  const labels: Record<string, string[]> = {
    maintenance: ["Anode replacement", "Filter cleaning", "Bath agitation check", "Electrode inspection"],
    chemical: ["pH adjustment", "Add brightener", "Add wetting agent", "Metal salt replenishment"],
    measurement: ["Thickness check", "Current density log", "Temperature recording", "pH measurement"],
    alarm: ["Temperature spike", "Current fluctuation", "pH deviation", "Thickness low"],
  };

  const type = types[Math.floor(Math.random() * types.length)];
  const label = labels[type][Math.floor(Math.random() * labels[type].length)];

  return {
    time: new Date(),
    type,
    label,
    description: `${label} — ${new Date().toLocaleTimeString("en-US")}`,
  };
};

// Generate initial events
const initEvents = () => {
  const now = Date.now();
  const initialEvents: ProcessEvent[] = [
    { time: new Date(now - 300000), type: "start", label: "Bath started", description: "Process cycle initiated" },
    { time: new Date(now - 240000), type: "measurement", label: "Initial thickness", description: "Baseline: 0.0 μm" },
    { time: new Date(now - 180000), type: "chemical", label: "pH adjustment", description: "Adjusted to 4.2" },
    { time: new Date(now - 120000), type: "measurement", label: "Thickness check", description: "Current: 8.3 μm" },
    { time: new Date(now - 60000), type: "maintenance", label: "Filter check", description: "Flow rate normal" },
  ];
  events.value = initialEvents;
};

let svg: d3.Selection<SVGGElement, unknown, null, undefined>;
let xScale: d3.ScaleTime<number, number>;
let xAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
let width = 0;
let height = 0;

const initChart = () => {
  if (!chartRef.value) return;

  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  width = chartRef.value.clientWidth - margin.left - margin.right;
  height = 200 - margin.top - margin.bottom;

  svg = d3
    .select(chartRef.value)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  xScale = d3.scaleTime().range([0, width]);

  // Timeline line
  svg
    .append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", height / 2)
    .attr("y2", height / 2)
    .attr("stroke", "#374151")
    .attr("stroke-width", 2);

  xAxisGroup = svg.append("g").attr("transform", `translate(0,${height})`);

  svg.selectAll(".domain").attr("stroke", "#374151");
  svg.selectAll(".tick line").attr("stroke", "#374151");
};

const updateChart = () => {
  if (!svg || !events.value.length) return;

  const timeExtent = d3.extent(events.value, (d) => d.time) as [Date, Date];
  // Add padding to time range
  const padding = 30000; // 30 seconds
  xScale.domain([new Date(timeExtent[0].getTime() - padding), new Date(timeExtent[1].getTime() + padding)]);

  const midY = height / 2;

  // Event markers
  const markers = svg
    .selectAll<SVGGElement, ProcessEvent>(".event-marker")
    .data(events.value, (d) => d.time.toISOString());

  // EXIT
  markers.exit().transition().duration(300).attr("opacity", 0).remove();

  // ENTER + UPDATE
  const markersEnter = markers.enter().append("g").attr("class", "event-marker").attr("opacity", 0);

  // Vertical line from timeline
  markersEnter
    .append("line")
    .attr("stroke", (d) => eventTypes[d.type].color)
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "3");

  // Event circle
  markersEnter
    .append("circle")
    .attr("r", 8)
    .attr("fill", (d) => eventTypes[d.type].color);

  // Event icon
  markersEnter
    .append("text")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .attr("font-size", "10px")
    .attr("fill", "#fff");

  // Event label
  markersEnter.append("text").attr("text-anchor", "middle").attr("font-size", "10px").attr("fill", "#e5e7eb");

  // MERGE
  const all = markersEnter.merge(markers);

  all
    .transition()
    .duration(300)
    .attr("opacity", 1)
    .attr("transform", (d, i) => {
      const x = xScale(d.time);
      // Alternate above and below timeline
      const offset = i % 2 === 0 ? -50 : 40;
      return `translate(${x},${midY + offset})`;
    });

  all
    .select("line")
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", (_d, i) => (i % 2 === 0 ? 8 : -8))
    .attr("y2", (_d, i) => (i % 2 === 0 ? 50 : -40));

  all.select("circle").attr("fill", (d) => eventTypes[d.type].color);

  all.select("text:first-of-type").text((d) => eventTypes[d.type].icon);

  all
    .select("text:last-of-type")
    .attr("y", (_d, i) => (i % 2 === 0 ? -18 : 18))
    .attr("text-anchor", "middle")
    .attr("font-size", "9px")
    .each(function (d, i) {
      const el = d3.select(this);
      el.text("");
      if (i > 0) {
        const prevX = xScale(events.value[i - 1].time);
        const curX = xScale(d.time);
        if (Math.abs(curX - prevX) < 80) return;
      }
      const words = d.label.split(" ");
      if (words.length > 1) {
        el.append("tspan").attr("x", 0).attr("dy", "-0.3em").text(words[0]);
        el.append("tspan").attr("x", 0).attr("dy", "1.1em").text(words.slice(1).join(" "));
      } else {
        el.text(d.label);
      }
    });

  // X axis
  xAxisGroup.call(
    d3
      .axisBottom(xScale)
      .ticks(5)
      .tickFormat(d3.timeFormat("%H:%M:%S") as (d: Date | d3.NumberValue) => string),
  );
  xAxisGroup.selectAll("text").attr("fill", "#9ca3af").attr("font-size", "10px");
};

// Add new event periodically
let eventInterval: number;
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
  initEvents();
  nextTick(() => {
    initChart();
    updateChart();
    window.addEventListener("resize", handleResize);
  });

  // Add new event every 8-15 seconds
  eventInterval = window.setInterval(
    () => {
      events.value.push(generateEvent());
      // Keep last 20 events
      if (events.value.length > 20) {
        events.value = events.value.slice(-20);
      }
    },
    8000 + Math.random() * 7000,
  );
});

onUnmounted(() => {
  clearInterval(eventInterval);
  window.removeEventListener("resize", handleResize);
});

watch(
  () => events.value.length,
  () => {
    nextTick(updateChart);
  },
);
</script>

<template>
  <div class="weg-zeit">
    <div class="chart-header">
      <h3>Process Timeline (Weg-Zeit Diagram)</h3>
      <div class="legend">
        <span v-for="(config, type) in eventTypes" :key="type" class="legend-item">
          <span class="legend-dot" :style="{ background: config.color }">{{ config.icon }}</span>
          {{ type }}
        </span>
      </div>
    </div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<style scoped>
.weg-zeit {
  background: #1f2937;
  border-radius: 12px;
  padding: 16px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.chart-header h3 {
  margin: 0;
  font-size: 14px;
  color: #e5e7eb;
  font-weight: 500;
}

.legend {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #9ca3af;
  text-transform: capitalize;
}

.legend-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  line-height: 1;
}

.chart-container {
  width: 100%;
  height: 200px;
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .legend {
    gap: 8px;
  }
}
</style>

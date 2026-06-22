# Electroplating Process Monitor

Real-time dashboard for monitoring electroplating bath parameters — built with Vue 3, D3.js, Three.js, and TypeScript.

## What It Does

Simulates industrial process data and visualizes it across multiple chart types:

| Component        | Description                                                                |
| ---------------- | -------------------------------------------------------------------------- |
| **LineChart**    | Real-time data stream with animated line, gradient fill, warning threshold |
| **GaugeChart**   | Semicircular dial with colored zones and needle indicator                  |
| **BarChart**     | Historical data aggregated into 10-second time buckets                     |
| **Bath3D**       | Interactive 3D plating bath with liquid, electrodes, and visible waterline |
| **InsightPanel** | AI-generated process recommendations based on current values               |
| **Metric Cards** | Live current values for all 4 monitored parameters                         |
| **Live Toggle**  | Pause/resume the real-time data stream                                     |

### Monitored Parameters

| Metric            | Unit  | Warning Threshold |
| ----------------- | ----- | ----------------- |
| Bath Temperature  | °C    | 45                |
| Current Density   | A/dm² | 7                 |
| pH Level          | pH    | 10                |
| Plating Thickness | μm    | 20                |

## Tech Stack

- **Vue 3** — Composition API, `<script setup>`, reactive composables
- **TypeScript** — Strict types for all data structures and component props
- **D3.js** — Custom SVG charts (scales, axes, generators, transitions)
- **Three.js** — Interactive 3D bath visualization with OrbitControls (drag to rotate, scroll to zoom)
- **Vite** — Fast dev server and optimized builds
- **Bun** — Package manager and runtime

## Project Structure

```
src/
├── components/
│   ├── LineChart.vue          # D3 real-time line chart
│   ├── GaugeChart.vue         # D3 semicircular gauge
│   ├── BarChart.vue           # D3 aggregated bar chart
│   ├── BathVisualization3D.vue # Three.js 3D bath
│   └── InsightPanel.vue       # AI process insights
├── composables/
│   └── useProcessData.ts      # Simulated sensor data generation
├── types/
│   └── processData.ts         # TypeScript interfaces and metric configs
├── App.vue                    # Dashboard layout
├── main.ts                    # App entry point
└── style.css                  # Global styles
```

## Setup

```bash
# Install dependencies
bun install

# Start dev server
bun dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Architecture

### Data Flow

```
useProcessData() → ref<ProcessPoint[]>
       ↓
  getMetricData(name) → computed filtered array
       ↓
  getCurrentValue(name) → computed latest value
       ↓
  Components receive data via props → D3/Three.js renders
```

### D3 + Vue Integration Pattern

D3 handles SVG internals while Vue manages the reactive data layer:

1. Container `ref` mounts the SVG via D3 on `onMounted`
2. `watch` on data triggers `nextTick` → re-render
3. `selectAll('*').remove()` clears old chart before redrawing
4. Scales map data values to pixel positions
5. Generators (`d3.line`, `d3.area`, `d3.arc`) create SVG paths

### Data Simulation

The `useProcessData` composable generates realistic sensor behavior:

- **Noise** — small random jitter each tick (measurement imprecision)
- **Drift** — slow sine wave oscillation (natural process fluctuation)
- **Spikes** — 2% chance of sudden disturbance per tick
- **Clamping** — values stay within metric's min/max range

### Three.js 3D Visualization

The plating bath is built from multiple Three.js primitives:

- **Bath shell** — semi-transparent cylinder (MeshStandardMaterial)
- **Liquid** — slightly smaller cylinder with `MeshPhysicalMaterial` for realistic transparency
- **Surface disc** — nearly-opaque circle on top for visible waterline
- **Electrodes** — two thin metallic cylinders
- **Platform** — base cylinder underneath

Interaction:

- **Drag** — rotate the bath (OrbitControls)
- **Scroll** — zoom in/out
- **Temperature-based color** — liquid shifts blue → yellow → red as temperature rises

## Key D3 Concepts

| Concept              | Usage                                          |
| -------------------- | ---------------------------------------------- |
| `scaleTime`          | Maps timestamps to X axis positions            |
| `scaleLinear`        | Maps value ranges to Y axis positions          |
| `scaleBand`          | Maps categories to evenly-spaced bar positions |
| `d3.line()`          | Generates SVG path from data points            |
| `d3.area()`          | Generates filled area under line               |
| `d3.arc()`           | Generates arc paths for gauge                  |
| `curveMonotoneX`     | Smooths lines between points                   |
| `d3.axisBottom/Left` | Renders axis with ticks and labels             |

## Key Three.js Concepts

| Concept                      | Usage                                                         |
| ---------------------------- | ------------------------------------------------------------- |
| `PerspectiveCamera`          | FOV, aspect ratio, near/far clipping planes                   |
| `MeshPhysicalMaterial`       | `transmission`, `roughness`, `metalness` for realistic liquid |
| `OrbitControls`              | Drag-to-rotate and scroll-to-zoom interaction                 |
| `requestAnimationFrame`      | Render loop for smooth animation                              |
| Temperature-to-color mapping | Linear interpolation across blue → yellow → red               |

## What I Learned

- **D3 is imperative, Vue is declarative** — bridging them requires watch + nextTick + container ref
- **Scales are the core of D3** — once you understand data → pixel mapping, everything follows
- **Three.js is straightforward** — Scene, Camera, Renderer + OrbitControls for interaction
- **MeshPhysicalMaterial** — `transmission` and `roughness` properties create realistic liquid
- **Composables keep data logic clean** — separating simulation from rendering makes both testable

## Next Steps

- WebSocket integration for real-time sensor data
- Alert notification system with sound
- Historical data persistence with SQL database
- Docker containerization for deployment
- CI/CD pipeline with GitHub Actions

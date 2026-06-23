# Electroplating Process Monitor

Real-time dashboard for monitoring electroplating bath parameters — built with Vue 3, D3.js, Three.js, and TypeScript.

**Live demo:** [electroplating-monitor.vercel.app](https://electroplating-monitor.vercel.app/)

## What It Does

Simulates industrial process data and visualizes it across multiple chart types:

| Component          | Description                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| **LineChart**      | Real-time data stream with animated line, gradient fill, warning threshold                                    |
| **GaugeChart**     | Semicircular dial with colored zones and needle indicator                                                     |
| **BarChart**       | Historical data aggregated into 10-second time buckets with error bars                                        |
| **Bath3D**         | Interactive 3D plating bath with liquid, electrodes, and visible waterline                                    |
| **WegZeitDiagram** | Process timeline showing maintenance, chemical, measurement, and alarm events                                 |
| **InsightPanel**   | AI-generated process recommendations based on current values                                                  |
| **MetricsBar**     | Live current values for all 4 monitored parameters                                                            |
| **Maintenance**    | Bath maintenance module with task scheduling and tracking, backed by a Postgres database via a serverless API |

### Monitored Parameters

| Metric            | Unit  | Warning Threshold |
| ----------------- | ----- | ----------------- |
| Bath Temperature  | °C    | 50                |
| Current Density   | A/dm² | 7                 |
| pH Level          | pH    | 10                |
| Plating Thickness | μm    | 20                |

## Tech Stack

- **Vue 3** — Composition API, `<script setup>`, reactive composables
- **Vue Router** — Client-side routing with lazy-loaded maintenance module
- **TypeScript** — Strict types for all data structures and component props
- **D3.js** — Custom SVG charts (scales, axes, generators, transitions)
- **Three.js** — Interactive 3D bath visualization with OrbitControls
- **Vite** — Fast dev server and optimized builds
- **Bun** — Package manager and runtime
- **Vercel** — Deployment, hosting, and serverless functions
- **GitHub Actions** — CI/CD pipeline
- **Drizzle ORM** — Typed schema and queries for the maintenance tasks database
- **Vercel Postgres (Neon)** — Persistent storage for maintenance tasks

## Project Structure

```
api/
├── db/
│   ├── client.ts                  # Drizzle client (Vercel Postgres pool)
│   └── schema/
│       ├── index.ts               # Re-exports all tables
│       └── maintenanceTasks.ts    # maintenance_tasks table + status enum
├── tasks/
│   ├── index.ts                   # GET (list) / POST (create)
│   └── [id].ts                    # PATCH (update status) / DELETE
src/
├── components/
│   ├── dashboard/
│   │   ├── LineChart.vue          # D3 real-time line chart
│   │   ├── GaugeChart.vue         # D3 semicircular gauge
│   │   ├── BarChart.vue           # D3 aggregated bar chart
│   │   ├── BathVisualization3D.vue # Three.js 3D bath
│   │   ├── WegZeitDiagram.vue     # Process timeline
│   │   ├── InsightPanel.vue       # AI process insights
│   │   ├── MetricsBar.vue         # Live metric cards
│   │   ├── DashboardHeader.vue    # Header with live toggle
│   │   └── DashboardFooter.vue    # Footer
│   └── maintenance/
│       ├── StatsBar.vue           # Task statistics
│       ├── TaskForm.vue           # Add task form
│       └── TaskCard.vue           # Task display with actions
├── composables/
│   ├── useProcessData.ts          # Simulated sensor data generation
│   └── useLiveState.ts            # Shared live/pause state
├── router/
│   └── index.ts                   # Vue Router config
├── types/
│   ├── processData.ts             # TypeScript interfaces and metric configs
│   └── maintenance.ts             # Maintenance task types
├── views/
│   ├── DashboardView.vue          # Main monitoring dashboard
│   └── MaintenanceView.vue        # Bath maintenance module
├── App.vue                        # Shell with nav and router-view
├── main.ts                        # App entry point with router
└── style.css                      # Global styles
```

## Setup

```bash
# Install dependencies
bun install

# Pull database env vars from the linked Vercel project (one-time)
bunx vercel link
bunx vercel env pull .env.local

# Push the Drizzle schema to the database (one-time / after schema changes)
bun run db:push

# Start dev server (frontend only, no /api routes)
bun dev

# Start dev server with /api routes (use this when testing the maintenance API)
bunx vercel dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## API

The maintenance module is backed by a serverless API (`api/tasks/*`) and a Postgres database (Vercel Postgres / Neon), queried via Drizzle ORM. All endpoints accept/return JSON.

| Method   | Path             | Body                                         | Description                                                    |
| -------- | ---------------- | -------------------------------------------- | -------------------------------------------------------------- |
| `GET`    | `/api/tasks`     | —                                            | List all maintenance tasks                                     |
| `POST`   | `/api/tasks`     | `{ type, description, technician, dueDate }` | Create a task (status defaults to `pending`)                   |
| `PATCH`  | `/api/tasks/:id` | `{ status }`                                 | Update a task's status (`pending` \| `completed` \| `overdue`) |
| `DELETE` | `/api/tasks/:id` | —                                            | Delete a task                                                  |

Schema (`maintenance_tasks` table): `id`, `date`, `type`, `description`, `technician`, `status` (Postgres enum), `dueDate`.

All error responses return `{ error: string }` with status `400` (validation), `404` (not found), `405` (wrong method), or `500` (server error).

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

1. `initChart()` creates SVG, scales, axes once in `onMounted`
2. `updateChart()` updates data-dependent elements only (no full rebuild)
3. `watch` on data triggers `nextTick` → `updateChart()`
4. `window.resize` listener redraws charts on viewport changes
5. Scales map data values to pixel positions
6. Generators (`d3.line`, `d3.area`, `d3.arc`) create SVG paths

### Data Simulation

The `useProcessData` composable generates realistic sensor behavior:

- **Noise** — small random jitter each tick (measurement imprecision)
- **Drift** — slow sine wave oscillation (natural process fluctuation)
- **Spikes** — 2% chance of sudden disturbance per tick
- **Clamping** — values stay within metric's min/max range

### Three.js 3D Visualization

The plating bath is built from multiple Three.js primitives:

- **Bath shell** — semi-transparent cylinder (MeshStandardMaterial)
- **Liquid** — slightly smaller cylinder with MeshStandardMaterial
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
| `d3.join()`          | D3 v7 enter/update/exit pattern for bars       |
| `curveMonotoneX`     | Smooths lines between points                   |
| `d3.axisBottom/Left` | Renders axis with ticks and labels             |

## Key Three.js Concepts

| Concept                      | Usage                                             |
| ---------------------------- | ------------------------------------------------- |
| `PerspectiveCamera`          | FOV, aspect ratio, near/far clipping planes       |
| `MeshStandardMaterial`       | Color, transparency, metalness for bath materials |
| `OrbitControls`              | Drag-to-rotate and scroll-to-zoom interaction     |
| `requestAnimationFrame`      | Render loop for smooth animation                  |
| Temperature-to-color mapping | Linear interpolation across blue → yellow → red   |

## What I Learned

- **D3 is imperative, Vue is declarative** — bridging them requires init/update separation, watch + nextTick + container ref
- **Scales are the core of D3** — once you understand data → pixel mapping, everything follows
- **Three.js is straightforward** — Scene, Camera, Renderer + OrbitControls for interaction
- **D3 transitions need `attrTween` for paths with structural flags** — animating an SVG arc's `d` attribute via plain `.attr()` lets D3 fall back to naive string interpolation, which can produce invalid values for flags that must stay integers (like an arc's sweep flag)

## Next Steps

- WebSocket integration for real-time sensor data
- Alert notification system with sound
- Persist process metric history (currently only maintenance tasks are persisted)
- Docker containerization

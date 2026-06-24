import { METRICS, type ProcessPoint } from "@src/types/processData";
import { computed, onMounted, onUnmounted, ref } from "vue";

export function useProcessData() {
  const data = ref<ProcessPoint[]>([]);
  const interval = ref<number | null>(null);

  /**
   * Produces a single simulated sensor reading.
   *
   * - Noise: small random jitter (±1) simulating measurement imprecision.
   * - Drift: slow sine oscillation over ~10 s cycle simulating natural
   *   process fluctuation (contributes ±0.2 to the value).
   * - Spike: 2% chance per call of a sudden ±5 disturbance.
   * - Clamping: result is clamped to [min, max] to stay within
   *   realistic bounds.
   */
  const generateValue = (current: number, min: number, max: number): number => {
    const noise = (Math.random() - 0.5) * 2;
    const drift = Math.sin(Date.now() / 10000) * 2;
    let newValue = current + noise + drift * 0.1;

    if (Math.random() < 0.02) {
      newValue += (Math.random() - 0.5) * 10;
    }

    return Math.max(min, Math.min(max, newValue));
  };

  /**
   * Appends one new data point for each metric, building on the last
   * known value (or seeding at 30% of the range on first call).
   * Caps the buffer at 100 points per metric (400 total) to prevent
   * unbounded memory growth.
   */
  const generateData = () => {
    const lastPoints: Record<string, number> = {};

    for (const point of data.value) {
      lastPoints[point.metric] = point.value;
    }

    for (const metric of METRICS) {
      const current =
        lastPoints[metric.name] ?? metric.thresholds.min + (metric.thresholds.max - metric.thresholds.min) * 0.3;
      const newValue = generateValue(current, metric.thresholds.min, metric.thresholds.max);

      data.value.push({
        time: new Date(),
        value: Math.round(newValue * 100) / 100,
        metric: metric.name,
      });
    }

    if (data.value.length > METRICS.length * 100) {
      data.value = data.value.slice(-METRICS.length * 100);
    }
  };

  const getMetricData = (metricName: string) => computed(() => data.value.filter((p) => p.metric === metricName));

  const getCurrentValue = (metricName: string) =>
    computed(() => {
      const metricData = data.value.filter((p) => p.metric === metricName);
      return metricData.length > 0 ? metricData[metricData.length - 1].value : 0;
    });

  /**
   * Starts data generation. On first call, seeds the buffer with 50
   * historical points per metric so charts aren't empty. Then ticks
   * every 1 second. Idempotent — calling while already running is a no-op.
   */
  const start = () => {
    if (!interval.value) {
      for (let i = 0; i < 50; i++) {
        generateData();
      }
    }

    interval.value = window.setInterval(generateData, 1000);
  };

  /** Stops the data generation interval. Idempotent — safe to call when already stopped. */
  const stop = () => {
    if (interval.value) {
      clearInterval(interval.value);
      interval.value = null;
    }
  };

  onMounted(start);
  onUnmounted(stop);

  return { data, getMetricData, getCurrentValue, start, stop };
}

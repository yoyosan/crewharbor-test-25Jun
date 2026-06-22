<script setup lang="ts">
defineProps<{
  isLive: boolean
}>()

defineEmits<{
  toggle: []
}>()
</script>

<template>
  <header class="dashboard-header">
    <div class="header-content">
      <h1>Electroplating Process Monitor</h1>
      <p class="subtitle">Real-time bath monitoring and quality control</p>
    </div>
    <div class="status-controls">
      <div class="status-badge">
        <span class="status-dot" :class="{ paused: !isLive }"></span>
        {{ isLive ? "Live" : "Paused" }}
      </div>
      <button class="toggle-btn" @click="$emit('toggle')">
        {{ isLive ? "⏸ Pause" : "▶ Resume" }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #374151;
}

.header-content h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #f9fafb;
}

.subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: #9ca3af;
}

.status-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #064e3b;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: #34d399;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #34d399;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-dot.paused {
  background: #78350f;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.toggle-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid #374151;
  background: #374151;
  color: #e5e7eb;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.toggle-btn:hover {
  background: #4b5563;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 12px;
  }

  .header-content h1 {
    font-size: 20px;
  }
}
</style>

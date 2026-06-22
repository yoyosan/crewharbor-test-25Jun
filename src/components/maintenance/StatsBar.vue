<script setup lang="ts">
defineProps<{
  total: number
  completed: number
  pending: number
  overdue: number
}>()
</script>

<template>
  <div class="stats-bar">
    <div class="stat-card">
      <span class="stat-value">{{ total }}</span>
      <span class="stat-label">Total Tasks</span>
    </div>
    <div class="stat-card completed">
      <span class="stat-value">{{ completed }}</span>
      <span class="stat-label">Completed</span>
    </div>
    <div class="stat-card pending">
      <span class="stat-value">{{ pending }}</span>
      <span class="stat-label">Pending</span>
    </div>
    <div class="stat-card overdue">
      <span class="stat-value">{{ overdue }}</span>
      <span class="stat-label">Overdue</span>
    </div>
  </div>
</template>

<style scoped>
.stats-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #1f2937;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #e5e7eb;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.stat-card.completed .stat-value { color: #10b981; }
.stat-card.pending .stat-value { color: #f59e0b; }
.stat-card.overdue .stat-value { color: #ef4444; }
</style>

<script setup lang="ts">
import type { MaintenanceTask } from '@src/types/maintenance'

defineProps<{ task: MaintenanceTask }>()

defineEmits<{
  complete: [id: number]
  delete: [id: number]
}>()

const statusColor = (status: string) => {
  switch (status) {
    case 'completed': return '#10b981'
    case 'pending': return '#f59e0b'
    case 'overdue': return '#ef4444'
    default: return '#6b7280'
  }
}
</script>

<template>
  <div class="task-card">
    <div class="task-main">
      <div class="task-type-badge" :style="{ borderColor: statusColor(task.status) }">
        {{ task.type }}
      </div>
      <div class="task-info">
        <h4>{{ task.description }}</h4>
        <div class="task-meta">
          <span>Assigned to {{ task.technician }}</span>
          <span>Due {{ task.dueDate }}</span>
        </div>
      </div>
    </div>
    <div class="task-actions">
      <span class="status-badge" :style="{ color: statusColor(task.status), background: statusColor(task.status) + '15' }">
        {{ task.status }}
      </span>
      <button v-if="task.status !== 'completed'" class="action-btn complete" @click="$emit('complete', task.id)">
        Complete
      </button>
      <button class="action-btn delete" @click="$emit('delete', task.id)">Delete</button>
    </div>
  </div>
</template>

<style scoped>
.task-card {
  background: #1f2937;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-main {
  display: flex;
  gap: 12px;
  align-items: center;
}

.task-type-badge {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid;
  font-size: 11px;
  font-weight: 500;
  color: #e5e7eb;
  background: rgba(255, 255, 255, 0.05);
}

.task-info h4 {
  margin: 0;
  font-size: 14px;
  color: #e5e7eb;
  font-weight: 500;
}

.task-meta {
  display: flex;
  gap: 16px;
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #374151;
  background: transparent;
  color: #9ca3af;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #374151;
  color: #e5e7eb;
}

.action-btn.complete {
  border-color: #10b981;
  color: #10b981;
}

.action-btn.complete:hover {
  background: rgba(16, 185, 129, 0.1);
}

.action-btn.delete {
  border-color: #ef4444;
  color: #ef4444;
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.1);
}
</style>

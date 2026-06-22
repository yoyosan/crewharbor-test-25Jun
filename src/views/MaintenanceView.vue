<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MaintenanceTask } from '@src/types/maintenance'
import StatsBar from '@src/components/maintenance/StatsBar.vue'
import TaskForm from '@src/components/maintenance/TaskForm.vue'
import TaskCard from '@src/components/maintenance/TaskCard.vue'

const tasks = ref<MaintenanceTask[]>([
  { id: 1, date: '2025-06-20', type: 'Chemical', description: 'pH level check and adjustment', technician: 'M. Schmidt', status: 'completed', dueDate: '2025-06-20' },
  { id: 2, date: '2025-06-21', type: 'Mechanical', description: 'Anode inspection and rotation', technician: 'K. Weber', status: 'completed', dueDate: '2025-06-21' },
  { id: 3, date: '2025-06-22', type: 'Filter', description: 'Carbon filter replacement', technician: 'A. Mueller', status: 'pending', dueDate: '2025-06-23' },
  { id: 4, date: '2025-06-25', type: 'Chemical', description: 'Brightener concentration test', technician: 'M. Schmidt', status: 'pending', dueDate: '2025-06-25' },
  { id: 5, date: '2025-06-28', type: 'Electrical', description: 'Rectifier calibration', technician: 'K. Weber', status: 'overdue', dueDate: '2025-06-20' },
])

const showForm = ref(false)

const stats = computed(() => ({
  total: tasks.value.length,
  completed: tasks.value.filter(t => t.status === 'completed').length,
  pending: tasks.value.filter(t => t.status === 'pending').length,
  overdue: tasks.value.filter(t => t.status === 'overdue').length,
}))

const addTask = (task: { type: string; description: string; technician: string; dueDate: string }) => {
  tasks.value.unshift({
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    ...task,
    status: 'pending',
  })
  showForm.value = false
}

const completeTask = (id: number) => {
  const task = tasks.value.find(t => t.id === id)
  if (task) task.status = 'completed'
}

const deleteTask = (id: number) => {
  tasks.value = tasks.value.filter(t => t.id !== id)
}
</script>

<template>
  <div class="maintenance">
    <div class="maintenance-header">
      <div>
        <h2>Bath Maintenance</h2>
        <p class="subtitle">Schedule and track maintenance tasks for electroplating baths</p>
      </div>
      <button class="add-btn" @click="showForm = !showForm">
        {{ showForm ? 'Cancel' : '+ Add Task' }}
      </button>
    </div>

    <StatsBar v-bind="stats" />

    <TaskForm v-if="showForm" @add="addTask" />

    <div class="task-list">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @complete="completeTask"
        @delete="deleteTask"
      />
    </div>
  </div>
</template>

<style scoped>
.maintenance-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.maintenance-header h2 {
  margin: 0;
  font-size: 20px;
  color: #f9fafb;
}

.subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: #9ca3af;
}

.add-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: #3b82f6;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.add-btn:hover {
  background: #2563eb;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>

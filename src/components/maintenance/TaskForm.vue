<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  add: [task: { type: string; description: string; technician: string; dueDate: string }]
}>()

const taskTypes = ['Chemical', 'Mechanical', 'Filter', 'Electrical', 'Cleaning', 'Inspection']

const form = ref({
  type: 'Chemical',
  description: '',
  technician: '',
  dueDate: '',
})

const submit = () => {
  if (!form.value.description || !form.value.technician || !form.value.dueDate) return
  emit('add', { ...form.value })
  form.value = { type: 'Chemical', description: '', technician: '', dueDate: '' }
}
</script>

<template>
  <div class="task-form">
    <h3>New Maintenance Task</h3>
    <div class="form-grid">
      <div class="form-group">
        <label>Type</label>
        <select v-model="form.type">
          <option v-for="type in taskTypes" :key="type" :value="type">{{ type }}</option>
        </select>
      </div>
      <div class="form-group">
        <label>Description</label>
        <input v-model="form.description" type="text" placeholder="Task description..." />
      </div>
      <div class="form-group">
        <label>Technician</label>
        <input v-model="form.technician" type="text" placeholder="Assigned to..." />
      </div>
      <div class="form-group">
        <label>Due Date</label>
        <input v-model="form.dueDate" type="date" />
      </div>
    </div>
    <button class="submit-btn" @click="submit">Create Task</button>
  </div>
</template>

<style scoped>
.task-form {
  background: #1f2937;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.task-form h3 {
  margin: 0 0 16px;
  font-size: 14px;
  color: #e5e7eb;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #374151;
  background: #111827;
  color: #e5e7eb;
  font-size: 13px;
}

.submit-btn {
  padding: 8px 20px;
  border-radius: 6px;
  border: none;
  background: #10b981;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}

.submit-btn:hover {
  background: #059669;
}
</style>

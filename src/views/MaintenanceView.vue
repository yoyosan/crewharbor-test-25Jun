<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { MaintenanceTask, MaintenanceTaskForm } from "@src/types/maintenance";
import StatsBar from "@src/components/maintenance/StatsBar.vue";
import TaskForm from "@src/components/maintenance/TaskForm.vue";
import TaskCard from "@src/components/maintenance/TaskCard.vue";

const tasks = ref<MaintenanceTask[]>([]);
const showForm = ref(false);
const isLoading = ref(false);
const error = ref<string | null>(null);
const isSubmitting = ref(false);
const pendingIds = ref<Set<number>>(new Set());

const parseError = async (res: Response) => {
  const body = await res.json().catch(() => null);
  return body?.error ?? `Request failed (${res.status})`;
};

const fetchTasks = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const res = await fetch("/api/tasks");
    if (!res.ok) {
      throw new Error(await parseError(res));
    }

    tasks.value = await res.json();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load tasks";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchTasks);

const stats = computed(() => ({
  total: tasks.value.length,
  completed: tasks.value.filter((t) => t.status === "completed").length,
  pending: tasks.value.filter((t) => t.status === "pending").length,
  overdue: tasks.value.filter((t) => t.status === "overdue").length,
}));

const addTask = async (task: MaintenanceTaskForm) => {
  error.value = null;
  isSubmitting.value = true;
  try {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    if (!res.ok) {
      throw new Error(await parseError(res));
    }

    const created = await res.json();
    tasks.value.unshift(created);
    showForm.value = false;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to create task";
  } finally {
    isSubmitting.value = false;
  }
};

const completeTask = async (id: number) => {
  error.value = null;
  pendingIds.value.add(id);
  try {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    if (!res.ok) {
      throw new Error(await parseError(res));
    }

    const updated = await res.json();
    const task = tasks.value.find((t) => t.id === id);
    if (task) {
      task.status = updated.status;
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to complete task";
  } finally {
    pendingIds.value.delete(id);
  }
};

const deleteTask = async (id: number) => {
  error.value = null;
  pendingIds.value.add(id);
  try {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      throw new Error(await parseError(res));
    }
    tasks.value = tasks.value.filter((t) => t.id !== id);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to delete task";
  } finally {
    pendingIds.value.delete(id);
  }
};
</script>

<template>
  <div class="maintenance">
    <div class="maintenance-header">
      <div>
        <h2>Bath Maintenance</h2>
        <p class="subtitle">Schedule and track maintenance tasks for electroplating baths</p>
      </div>
      <button class="add-btn" @click="showForm = !showForm">
        {{ showForm ? "Cancel" : "+ Add Task" }}
      </button>
    </div>

    <p v-if="error" class="error-banner">{{ error }}</p>

    <div v-if="isLoading" class="spinner-wrap">
      <span class="spinner"></span>
    </div>

    <template v-else>
      <StatsBar v-bind="stats" />
      <TaskForm v-if="showForm" :is-submitting="isSubmitting" @add="addTask" />
      <div class="task-list">
        <TaskCard
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          @complete="completeTask"
          @delete="deleteTask"
          :is-pending="pendingIds.has(task.id)"
        />
      </div>
    </template>
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

.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 16px;
}

.spinner-wrap {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #374151;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

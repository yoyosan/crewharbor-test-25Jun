<script setup lang="ts">
import DashboardHeader from "@src/components/dashboard/DashboardHeader.vue";
import DashboardFooter from "@src/components/dashboard/DashboardFooter.vue";
import { useLiveState } from "@src/composables/useLiveState";

const { isLive, toggleLive } = useLiveState();
</script>

<template>
  <div class="app">
    <DashboardHeader :is-live="isLive" @toggle="toggleLive" />

    <nav class="nav-bar">
      <router-link to="/" class="nav-link">
        Dashboard
      </router-link>
      <router-link to="/maintenance" class="nav-link">
        Maintenance
      </router-link>
    </nav>

    <main class="main-content">
      <router-view />
    </main>

    <DashboardFooter />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #111827;
  color: #e5e7eb;
  padding: 24px;
  box-sizing: border-box;
}

.nav-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #374151;
}

.nav-link {
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  color: #9ca3af;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #1f2937;
  color: #e5e7eb;
}

.nav-link.router-link-exact-active {
  background: #1f2937;
  color: #3b82f6;
}

.main-content {
  min-height: 60vh;
}

@media (max-width: 768px) {
  .app {
    padding: 16px;
  }
}
</style>

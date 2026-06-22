import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "@src/views/DashboardView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: DashboardView,
    },
    {
      path: "/maintenance",
      name: "maintenance",
      component: () => import("@src/views/MaintenanceView.vue"),
    },
  ],
});

export default router;

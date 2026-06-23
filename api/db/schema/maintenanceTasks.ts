import { pgTable, pgEnum, serial, text } from "drizzle-orm/pg-core";

export const taskStatusEnum = pgEnum("task_status", ["pending", "completed", "overdue"]);

export const maintenanceTasks = pgTable("maintenance_tasks", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  technician: text("technician").notNull(),
  status: taskStatusEnum("status").notNull(),
  dueDate: text("due_date").notNull(),
});

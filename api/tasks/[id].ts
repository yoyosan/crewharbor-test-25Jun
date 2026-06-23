import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { maintenanceTasks, taskStatusEnum } from "../db/schema/index.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = Number(req.query.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid task id" });
  }

  if (req.method === "PATCH") {
    const { status } = req.body;

    if (!taskStatusEnum.enumValues.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${taskStatusEnum.enumValues.join(", ")}` });
    }

    try {
      const [task] = await db.update(maintenanceTasks).set({ status }).where(eq(maintenanceTasks.id, id)).returning();

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      return res.status(200).json(task);
    } catch (e) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const [task] = await db.delete(maintenanceTasks).where(eq(maintenanceTasks.id, id)).returning();

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      return res.status(204).end();
    } catch (e) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["PATCH", "DELETE"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}

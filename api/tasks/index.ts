import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../db/client.js";
import { maintenanceTasks } from "../db/schema/index.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    try {
      const tasks = await db.select().from(maintenanceTasks);
      return res.status(200).json(tasks);
    } catch (e) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    const { type, description, technician, dueDate } = req.body;

    if (!type || !description || !technician || !dueDate) {
      return res.status(400).json({ error: "type, description, technician, and dueDate are required" });
    }

    try {
      const [task] = await db
        .insert(maintenanceTasks)
        .values({
          date: new Date().toISOString().split("T")[0],
          type,
          description,
          technician,
          dueDate,
          status: "pending",
        })
        .returning();

      return res.status(201).json(task);
    } catch (e) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}

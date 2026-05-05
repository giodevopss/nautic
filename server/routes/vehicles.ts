import { Router } from "express";
import { prisma } from "../db";

const router = Router();

router.get("/", async (_req, res) => {
  const vehicles = await prisma.vehicle.findMany({
    where: { fleetStatus: "AVAILABLE" },
    orderBy: { name: "asc" },
  });
  res.json(vehicles);
});

router.get("/:id", async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: req.params.id },
    include: { reservations: true },
  });
  if (!vehicle) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  res.json(vehicle);
});

export default router;

import { Router } from "express";
import { prisma } from "../db";
import { requireAdmin } from "../middleware/requireAdmin";
import { dateBlockOverlapWhere } from "../lib/availability";

const router = Router();
router.use(requireAdmin);

function omitPasswordHash<T extends { passwordHash?: string | null }>(row: T) {
  const { passwordHash: _, ...rest } = row;
  return rest;
}

const FLEET = ["AVAILABLE", "IN_USE", "MAINTENANCE"] as const;
const RESERVATION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
] as const;

router.get("/reservations", async (_req, res) => {
  const list = await prisma.reservation.findMany({
    include: { customer: true, vehicle: true },
    orderBy: { startDate: "desc" },
  });
  res.json(
    list.map((r) => ({
      ...r,
      customer: r.customer ? omitPasswordHash(r.customer) : r.customer,
    })),
  );
});

router.patch("/reservations/:id", async (req, res) => {
  const { status, notes } = req.body ?? {};
  const data: { status?: string; notes?: string | null } = {};
  if (status != null) {
    if (!(RESERVATION_STATUSES as readonly string[]).includes(status)) {
      res.status(400).json({ error: "Status inválido." });
      return;
    }
    data.status = status;
  }
  if (notes !== undefined) {
    data.notes =
      typeof notes === "string" && notes.trim() ? notes.trim().slice(0, 2000) : null;
  }
  if (Object.keys(data).length === 0) {
    res.status(400).json({ error: "Nada para atualizar." });
    return;
  }
  try {
    const updated = await prisma.reservation.update({
      where: { id: req.params.id },
      data,
      include: { customer: true, vehicle: true },
    });
    res.json({
      ...updated,
      customer: updated.customer ? omitPasswordHash(updated.customer) : updated.customer,
    });
  } catch {
    res.status(400).json({ error: "Reserva não encontrada ou falha ao atualizar." });
  }
});

router.get("/customers", async (_req, res) => {
  const list = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { reservations: true } } },
  });
  res.json(list.map((c) => omitPasswordHash(c)));
});

router.patch("/customers/:id", async (req, res) => {
  const { name, email, phone } = req.body ?? {};
  const data: { name?: string; email?: string; phone?: string } = {};
  if (typeof name === "string" && name.trim()) data.name = name.trim();
  if (typeof email === "string" && email.trim()) data.email = email.trim().toLowerCase();
  if (typeof phone === "string" && phone.trim()) data.phone = phone.trim();
  if (Object.keys(data).length === 0) {
    res.status(400).json({ error: "Nada para atualizar." });
    return;
  }
  try {
    const updated = await prisma.customer.update({
      where: { id: req.params.id },
      data,
    });
    res.json(omitPasswordHash(updated));
  } catch {
    res.status(400).json({ error: "Cliente não encontrado ou e-mail já em uso." });
  }
});

router.delete("/customers/:id", async (req, res) => {
  try {
    const count = await prisma.reservation.count({
      where: { customerId: req.params.id },
    });
    if (count > 0) {
      res.status(409).json({
        error: "Cliente possui reservas; não é possível excluir.",
      });
      return;
    }
    await prisma.customer.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(400).json({ error: "Falha ao excluir cliente." });
  }
});

router.get("/vehicles", async (_req, res) => {
  const list = await prisma.vehicle.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { reservations: true } } },
  });
  res.json(list);
});

router.post("/vehicles", async (req, res) => {
  const { name, type, description, pricePerHour, capacity, fleetStatus, imageUrl } =
    req.body ?? {};
  if (typeof name !== "string" || !name.trim()) {
    res.status(400).json({ error: "Nome obrigatório." });
    return;
  }
  if (type !== "LANCHA" && type !== "JETSKI") {
    res.status(400).json({ error: "Tipo deve ser LANCHA ou JETSKI." });
    return;
  }
  const price = Number(pricePerHour);
  if (!Number.isFinite(price) || price < 0) {
    res.status(400).json({ error: "Preço por hora inválido." });
    return;
  }
  const fs =
    fleetStatus && (FLEET as readonly string[]).includes(fleetStatus)
      ? fleetStatus
      : "AVAILABLE";
  try {
    const v = await prisma.vehicle.create({
      data: {
        name: name.trim(),
        type,
        description:
          typeof description === "string" && description.trim()
            ? description.trim()
            : null,
        pricePerHour: price,
        capacity: Math.max(1, Math.floor(Number(capacity) || 1)),
        fleetStatus: fs,
        imageUrl:
          typeof imageUrl === "string" && imageUrl.trim() ? imageUrl.trim() : null,
      },
    });
    res.status(201).json(v);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "Falha ao cadastrar embarcação." });
  }
});

router.patch("/vehicles/:id", async (req, res) => {
  const { name, type, description, pricePerHour, capacity, fleetStatus, imageUrl } =
    req.body ?? {};
  const data: Record<string, unknown> = {};
  if (typeof name === "string" && name.trim()) data.name = name.trim();
  if (type === "LANCHA" || type === "JETSKI") data.type = type;
  if (description !== undefined) {
    data.description =
      typeof description === "string" && description.trim()
        ? description.trim()
        : null;
  }
  if (pricePerHour !== undefined) {
    const price = Number(pricePerHour);
    if (!Number.isFinite(price) || price < 0) {
      res.status(400).json({ error: "Preço inválido." });
      return;
    }
    data.pricePerHour = price;
  }
  if (capacity !== undefined) {
    data.capacity = Math.max(1, Math.floor(Number(capacity) || 1));
  }
  if (fleetStatus !== undefined) {
    if (!(FLEET as readonly string[]).includes(fleetStatus)) {
      res.status(400).json({ error: "Status de frota inválido." });
      return;
    }
    data.fleetStatus = fleetStatus;
  }
  if (imageUrl !== undefined) {
    data.imageUrl =
      typeof imageUrl === "string" && imageUrl.trim() ? imageUrl.trim() : null;
  }
  if (Object.keys(data).length === 0) {
    res.status(400).json({ error: "Nada para atualizar." });
    return;
  }
  try {
    const v = await prisma.vehicle.update({
      where: { id: req.params.id },
      data,
    });
    res.json(v);
  } catch {
    res.status(400).json({ error: "Embarcação não encontrada." });
  }
});

router.delete("/vehicles/:id", async (req, res) => {
  try {
    const count = await prisma.reservation.count({
      where: { vehicleId: req.params.id },
    });
    if (count > 0) {
      res.status(409).json({
        error: "Embarcação possui reservas no histórico; não é possível excluir.",
      });
      return;
    }
    await prisma.dateBlock.deleteMany({ where: { vehicleId: req.params.id } });
    await prisma.vehicle.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(400).json({ error: "Falha ao excluir embarcação." });
  }
});

router.get("/blocks", async (_req, res) => {
  const list = await prisma.dateBlock.findMany({
    include: { vehicle: true },
    orderBy: { startDate: "asc" },
  });
  res.json(list);
});

router.post("/blocks", async (req, res) => {
  const { vehicleId, startDate, endDate, reason } = req.body ?? {};
  const start = typeof startDate === "string" ? new Date(startDate) : null;
  const end = typeof endDate === "string" ? new Date(endDate) : null;
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    res.status(400).json({ error: "Datas inválidas." });
    return;
  }
  if (end.getTime() <= start.getTime()) {
    res.status(400).json({ error: "O fim deve ser depois do início." });
    return;
  }
  let vid: string | null = null;
  if (vehicleId != null && vehicleId !== "") {
    if (typeof vehicleId !== "string") {
      res.status(400).json({ error: "Embarcação inválida." });
      return;
    }
    const exists = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!exists) {
      res.status(404).json({ error: "Embarcação não encontrada." });
      return;
    }
    vid = vehicleId;
  }
  try {
    const block = await prisma.dateBlock.create({
      data: {
        vehicleId: vid,
        startDate: start,
        endDate: end,
        reason:
          typeof reason === "string" && reason.trim()
            ? reason.trim().slice(0, 500)
            : null,
      },
      include: { vehicle: true },
    });
    res.status(201).json(block);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "Falha ao criar bloqueio." });
  }
});

router.delete("/blocks/:id", async (req, res) => {
  try {
    await prisma.dateBlock.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(400).json({ error: "Bloqueio não encontrado." });
  }
});

router.get("/availability", async (req, res) => {
  const now = new Date();
  const fromRaw = req.query.from;
  const toRaw = req.query.to;
  const from =
    typeof fromRaw === "string" && fromRaw
      ? new Date(fromRaw)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const to =
    typeof toRaw === "string" && toRaw
      ? new Date(toRaw)
      : new Date(from.getTime() + 30 * 24 * 60 * 60 * 1000);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    res.status(400).json({ error: "Intervalo inválido." });
    return;
  }
  const [reservations, blocks, vehicles] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        AND: [{ startDate: { lt: to } }, { endDate: { gt: from } }],
      },
      include: { customer: true, vehicle: true },
      orderBy: { startDate: "asc" },
    }),
    prisma.dateBlock.findMany({
      where: {
        AND: [{ startDate: { lt: to } }, { endDate: { gt: from } }],
      },
      include: { vehicle: true },
      orderBy: { startDate: "asc" },
    }),
    prisma.vehicle.findMany({ orderBy: { name: "asc" } }),
  ]);
  res.json({
    from,
    to,
    reservations: reservations.map((r) => ({
      ...r,
      customer: r.customer ? omitPasswordHash(r.customer) : r.customer,
    })),
    blocks,
    vehicles,
  });
});

export default router;

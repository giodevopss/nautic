import { Router } from "express";
import { prisma } from "../db";
import { dateBlockOverlapWhere } from "../lib/availability";
import {
  getJetskiProduct,
} from "../../src/lib/jetski-pricing";
import {
  getLanchaPackagePrice,
  isLanchaDuration,
} from "../../src/lib/lancha-pricing";

const router = Router();

const ACTIVE_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED"] as const;

const MIN_BLOCK_H = 1 / 60; /* 1 min */
const MAX_BLOCK_H = 12;

function parseStartEnd(
  startAt: unknown,
  durationHours: unknown,
  opts?: { integerOnly?: boolean },
) {
  if (typeof startAt !== "string" || !startAt) return null;
  const startDate = new Date(startAt);
  if (Number.isNaN(startDate.getTime())) return null;
  const hours = Number(durationHours);
  if (!Number.isFinite(hours)) return null;
  if (opts?.integerOnly) {
    if (!Number.isInteger(hours) || hours < 1 || hours > MAX_BLOCK_H) return null;
  } else {
    if (hours < MIN_BLOCK_H || hours > MAX_BLOCK_H) return null;
  }
  const endMs = startDate.getTime() + Math.round(hours * 60 * 60 * 1000);
  const endDate = new Date(endMs);
  return { startDate, endDate, hours };
}

function asBool(v: unknown): boolean {
  return v === true || v === "true" || v === 1 || v === "1";
}

router.post("/book", async (req, res) => {
  const {
    vehicleId,
    startAt,
    durationHours,
    jetskiProductKey,
    customer,
    notes,
    optMarinerPilot,
    optDroneFilming,
    optChurrasco,
    optCooler,
    optSom,
  } = req.body ?? {};
  const c = customer as Record<string, unknown> | undefined;
  const name = typeof c?.name === "string" ? c.name.trim() : "";
  const email = typeof c?.email === "string" ? c.email.trim().toLowerCase() : "";
  const phone = typeof c?.phone === "string" ? c.phone.trim() : "";

  if (typeof vehicleId !== "string" || !vehicleId) {
    res.status(400).json({ error: "Selecione uma embarcação." });
    return;
  }
  if (!name || !email || !phone) {
    res.status(400).json({ error: "Preencha nome, e-mail e telefone." });
    return;
  }

  try {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, fleetStatus: "AVAILABLE" },
    });
    if (!vehicle) {
      res.status(404).json({ error: "Embarcação não encontrada ou indisponível." });
      return;
    }

    const isJetski = vehicle.type === "JETSKI";
    let blockHours: number;
    let totalPrice: number;
    let jetskiKey: string | null = null;
    let droneFromPackage = false;

    if (isJetski) {
      const key =
        typeof jetskiProductKey === "string" ? jetskiProductKey.trim() : "";
      const prod = getJetskiProduct(key);
      if (!prod) {
        res.status(400).json({
          error: "Selecione um pacote de jetski válido (rota ou tempo).",
        });
        return;
      }
      jetskiKey = prod.key;
      blockHours = prod.durationHours;
      totalPrice = prod.priceBRL;
      droneFromPackage = prod.includesDrone;
    } else {
      const parsedHours = parseStartEnd(startAt, durationHours, {
        integerOnly: true,
      });
      if (!parsedHours) {
        res.status(400).json({
          error: "Data, horário ou duração inválidos (duração: 1 a 12 horas).",
        });
        return;
      }
      if (!isLanchaDuration(parsedHours.hours)) {
        res.status(400).json({
          error: "Duração para lancha deve ser de 4h ou 8h.",
        });
        return;
      }
      blockHours = parsedHours.hours;
      const packagePrice = getLanchaPackagePrice(vehicle.id, blockHours);
      if (packagePrice == null) {
        res.status(400).json({
          error: "Pacote de preço não configurado para esta lancha.",
        });
        return;
      }
      totalPrice = packagePrice;
    }

    const parsed = parseStartEnd(startAt, blockHours, { integerOnly: false });
    if (!parsed) {
      res.status(400).json({
        error: "Não foi possível calcular o período da reserva.",
      });
      return;
    }
    const { startDate, endDate } = parsed;

    if (startDate.getTime() < Date.now() - 60 * 1000) {
      res.status(400).json({ error: "O horário de início deve ser no futuro." });
      return;
    }

    const blocked = await prisma.dateBlock.findFirst({
      where: dateBlockOverlapWhere(vehicleId, startDate, endDate),
    });
    if (blocked) {
      res.status(409).json({
        error:
          "Período bloqueado para esta embarcação ou para toda a frota. Escolha outra data.",
      });
      return;
    }

    const overlap = await prisma.reservation.findFirst({
      where: {
        vehicleId,
        status: { in: [...ACTIVE_STATUSES] },
        AND: [{ startDate: { lt: endDate } }, { endDate: { gt: startDate } }],
      },
    });
    if (overlap) {
      res.status(409).json({
        error: "Este horário já está reservado para a embarcação escolhida.",
      });
      return;
    }

    const isLancha = vehicle.type === "LANCHA";
    const mariner = asBool(optMarinerPilot);
    const drone = isJetski ? droneFromPackage : asBool(optDroneFilming);
    const churrasco = isLancha && asBool(optChurrasco);
    const cooler = isLancha && asBool(optCooler);
    const som = isLancha && asBool(optSom);

    const result = await prisma.$transaction(async (tx) => {
      const cust = await tx.customer.upsert({
        where: { email },
        create: { name, email, phone },
        update: { name, phone },
      });
      const notesStr =
        typeof notes === "string" && notes.trim() ? notes.trim().slice(0, 2000) : null;
      const reservation = await tx.reservation.create({
        data: {
          customerId: cust.id,
          vehicleId: vehicle.id,
          startDate,
          endDate,
          totalPrice,
          status: "PENDING",
          notes: notesStr,
          jetskiProductKey: jetskiKey,
          optMarinerPilot: mariner,
          optDroneFilming: drone,
          optChurrasco: churrasco,
          optCooler: cooler,
          optSom: som,
        },
        include: { customer: true, vehicle: true },
      });
      return reservation;
    });

    res.status(201).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Não foi possível concluir a reserva." });
  }
});

export default router;

import type { Prisma } from "@prisma/client";

/** Intervalo [startDate, endDate) overlap com bloqueios (frota inteira ou embarcação específica). */
export function dateBlockOverlapWhere(
  vehicleId: string,
  startDate: Date,
  endDate: Date,
): Prisma.DateBlockWhereInput {
  return {
    AND: [
      { startDate: { lt: endDate } },
      { endDate: { gt: startDate } },
      { OR: [{ vehicleId: null }, { vehicleId }] },
    ],
  };
}

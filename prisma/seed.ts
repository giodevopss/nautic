import "dotenv/config";
import "../server/patch-database-url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const vehicles = [
    {
      id: "lancha-29",
      name: "Lancha 29",
      type: "LANCHA",
      description:
        "Lancha de 29 pés para passeios de 4h ou 8h com valor de pacote.",
      pricePerHour: 0,
      capacity: 10,
      fleetStatus: "AVAILABLE",
    },
    {
      id: "lancha-24",
      name: "Lancha 24",
      type: "LANCHA",
      description:
        "Lancha de 24 pés para passeios de 4h ou 8h com valor de pacote.",
      pricePerHour: 0,
      capacity: 6,
      fleetStatus: "AVAILABLE",
    },
    {
      id: "jetski-gtx-130",
      name: "Sea-Doo GTI 170 SE",
      type: "JETSKI",
      description:
        "Único modelo da linha GTI 170 SE — preços por pacote na reserva (passeio, aluguel por tempo ou com drone).",
      pricePerHour: 0,
      capacity: 2,
      fleetStatus: "AVAILABLE",
    },
    {
      id: "jetski-fx-cruiser",
      name: "Sea-Doo GTI 130",
      type: "JETSKI",
      description:
        "Único modelo GTI 130 — mesma tabela de valores que o GTI 170 SE; escolha o pacote ao reservar.",
      pricePerHour: 0,
      capacity: 2,
      fleetStatus: "AVAILABLE",
    },
  ];

  await prisma.vehicle.deleteMany({
    where: {
      type: "LANCHA",
      id: { notIn: ["lancha-24", "lancha-29"] },
    },
  });

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { id: v.id },
      update: {
        name: v.name,
        description: v.description,
        pricePerHour: v.pricePerHour,
        capacity: v.capacity,
        fleetStatus: v.fleetStatus,
      },
      create: v,
    });
  }

  console.log("Seed completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

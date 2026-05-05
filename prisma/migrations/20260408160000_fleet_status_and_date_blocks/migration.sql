-- CreateTable
CREATE TABLE "date_blocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "date_blocks_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- AlterTable: add fleetStatus, backfill, drop available
ALTER TABLE "vehicles" ADD COLUMN "fleetStatus" TEXT NOT NULL DEFAULT 'AVAILABLE';
UPDATE "vehicles" SET "fleetStatus" = 'MAINTENANCE' WHERE "available" = 0;

-- SQLite: recreate vehicles without "available" (drop column)
CREATE TABLE "vehicles_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "pricePerHour" REAL NOT NULL,
    "imageUrl" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "fleetStatus" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "vehicles_new" ("id", "name", "type", "description", "pricePerHour", "imageUrl", "capacity", "fleetStatus", "createdAt", "updatedAt")
SELECT "id", "name", "type", "description", "pricePerHour", "imageUrl", "capacity", "fleetStatus", "createdAt", "updatedAt" FROM "vehicles";
DROP TABLE "vehicles";
ALTER TABLE "vehicles_new" RENAME TO "vehicles";

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN "optMarinerPilot" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "reservations" ADD COLUMN "optDroneFilming" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "reservations" ADD COLUMN "optChurrasco" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "reservations" ADD COLUMN "optCooler" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "reservations" ADD COLUMN "optSom" BOOLEAN NOT NULL DEFAULT false;

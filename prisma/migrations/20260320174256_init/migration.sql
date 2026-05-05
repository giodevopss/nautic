-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "pricePerHour" REAL NOT NULL,
    "imageUrl" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalPrice" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reservations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reservations_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

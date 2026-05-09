import "dotenv/config";
import "./patch-database-url";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

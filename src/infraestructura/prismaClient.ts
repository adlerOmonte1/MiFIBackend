import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// Prisma 7 no trae motor de queries por defecto: exige un driver adapter
// explícito (ver skill prisma-upgrade-v7 / referencia driver-adapters).
const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] });

export const prisma = new PrismaClient({ adapter });

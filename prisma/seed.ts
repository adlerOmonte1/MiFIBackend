import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] });
const prisma = new PrismaClient({ adapter });

/**
 * CAT-01 (docs/HistoriasUsuario.md) — catálogo predefinido, compartido por
 * todos los estudiantes (usuarioId queda NULL, D-13). Se distinguen así de
 * las categorías propias que cada estudiante puede crear (RF-53).
 */
const CATEGORIAS_PREDEFINIDAS = ["Comida", "Transporte", "Ocio", "Servicios", "Otros"];

async function main() {
  for (const nombre of CATEGORIAS_PREDEFINIDAS) {
    // No se puede usar upsert: el índice único (usuarioId, nombre) no sirve
    // como clave de búsqueda cuando usuarioId es NULL (Postgres trata cada
    // NULL como distinto). Se verifica a mano para que correr el seed
    // varias veces no duplique categorías.
    const existente = await prisma.categoria.findFirst({
      where: { usuarioId: null, nombre },
    });

    if (existente) {
      console.log(`  ya existía: ${nombre}`);
      continue;
    }

    await prisma.categoria.create({ data: { nombre, esPredefinida: true } });
    console.log(`  creada: ${nombre}`);
  }
}

main()
  .then(() => console.log("Seed de categorías predefinidas OK."))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

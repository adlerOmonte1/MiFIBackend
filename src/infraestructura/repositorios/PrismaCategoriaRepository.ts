import type { Categoria as FilaCategoria } from "../../generated/prisma/client";
import { Categoria } from "../../dominio/entidades/Categoria";
import type { ICategoriaRepository } from "../../dominio/repositorios/ICategoriaRepository";
import { prisma } from "../prismaClient";

function aDominio(fila: FilaCategoria): Categoria {
  return new Categoria({
    id: fila.id,
    usuarioId: fila.usuarioId,
    nombre: fila.nombre,
    esPredefinida: fila.esPredefinida,
  });
}

export class PrismaCategoriaRepository implements ICategoriaRepository {
  async buscarPorId(id: string): Promise<Categoria | null> {
    const fila = await prisma.categoria.findUnique({ where: { id } });
    return fila ? aDominio(fila) : null;
  }

  async listar(usuarioId: string): Promise<Categoria[]> {
    // Sin RF que especifique el orden: supuesto explícito, alfabético.
    const filas = await prisma.categoria.findMany({
      where: { OR: [{ usuarioId: null }, { usuarioId }] },
      orderBy: { nombre: "asc" },
    });
    return filas.map(aDominio);
  }
}

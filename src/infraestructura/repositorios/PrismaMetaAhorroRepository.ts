import type { MetaAhorro as FilaMetaAhorro } from "../../generated/prisma/client";
import { MetaAhorro, type EstadoMetaAhorro } from "../../dominio/entidades/MetaAhorro";
import type {
  DatosNuevaMetaAhorro,
  IMetaAhorroRepository,
} from "../../dominio/repositorios/IMetaAhorroRepository";
import { prisma } from "../prismaClient";

function aDominio(fila: FilaMetaAhorro): MetaAhorro {
  return new MetaAhorro({
    id: fila.id,
    usuarioId: fila.usuarioId,
    nombre: fila.nombre,
    montoObjetivo: fila.montoObjetivo.toNumber(),
    fechaLimite: fila.fechaLimite,
    estado: fila.estado as EstadoMetaAhorro,
    fechaCreacion: fila.fechaCreacion,
  });
}

export class PrismaMetaAhorroRepository implements IMetaAhorroRepository {
  async buscarPorId(id: string): Promise<MetaAhorro | null> {
    const fila = await prisma.metaAhorro.findUnique({ where: { id } });
    return fila ? aDominio(fila) : null;
  }

  async listar(usuarioId: string): Promise<MetaAhorro[]> {
    const filas = await prisma.metaAhorro.findMany({ where: { usuarioId } });
    return filas.map(aDominio);
  }

  async crear(datos: DatosNuevaMetaAhorro): Promise<MetaAhorro> {
    const fila = await prisma.metaAhorro.create({
      data: {
        usuarioId: datos.usuarioId,
        nombre: datos.nombre,
        montoObjetivo: datos.montoObjetivo,
        fechaLimite: datos.fechaLimite,
      },
    });
    return aDominio(fila);
  }

  async marcarInactiva(id: string): Promise<MetaAhorro> {
    const fila = await prisma.metaAhorro.update({ where: { id }, data: { estado: "inactiva" } });
    return aDominio(fila);
  }

  async eliminar(id: string): Promise<void> {
    await prisma.metaAhorro.delete({ where: { id } });
  }
}

import type { Sesion as FilaSesion } from "../../generated/prisma/client";
import { Sesion } from "../../dominio/entidades/Sesion";
import type {
  DatosNuevaSesion,
  ISesionRepository,
} from "../../dominio/repositorios/ISesionRepository";
import { prisma } from "../prismaClient";

function aDominio(fila: FilaSesion): Sesion {
  return new Sesion({
    id: fila.id,
    usuarioId: fila.usuarioId,
    jti: fila.jti,
    fechaCreacion: fila.fechaCreacion,
    fechaExpiracion: fila.fechaExpiracion,
    revocada: fila.revocada,
  });
}

export class PrismaSesionRepository implements ISesionRepository {
  async crear(datos: DatosNuevaSesion): Promise<Sesion> {
    const fila = await prisma.sesion.create({
      data: {
        usuarioId: datos.usuarioId,
        jti: datos.jti,
        fechaExpiracion: datos.fechaExpiracion,
      },
    });
    return aDominio(fila);
  }

  async buscarPorJti(jti: string): Promise<Sesion | null> {
    const fila = await prisma.sesion.findUnique({ where: { jti } });
    return fila ? aDominio(fila) : null;
  }

  async revocarPorJti(jti: string): Promise<void> {
    await prisma.sesion.update({ where: { jti }, data: { revocada: true } });
  }
}

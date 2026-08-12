import type { Transaccion as FilaTransaccion } from "../../generated/prisma/client";
import {
  Transaccion,
  type TipoTransaccion,
  type OrigenTransaccion,
} from "../../dominio/entidades/Transaccion";
import type {
  DatosNuevaTransaccion,
  FiltrosTransacciones,
  ITransaccionRepository,
  ResultadoListaTransacciones,
} from "../../dominio/repositorios/ITransaccionRepository";
import { prisma } from "../prismaClient";

function aDominio(fila: FilaTransaccion): Transaccion {
  return new Transaccion({
    id: fila.id,
    usuarioId: fila.usuarioId,
    categoriaId: fila.categoriaId,
    metaAhorroId: fila.metaAhorroId,
    // Decimal -> number: el dominio no depende de infraestructura (Transaccion.ts).
    monto: fila.monto.toNumber(),
    tipo: fila.tipo as TipoTransaccion,
    fecha: fila.fecha,
    origen: fila.origen as OrigenTransaccion,
    esGastoHormiga: fila.esGastoHormiga,
    esGastoHormigaUsuario: fila.esGastoHormigaUsuario,
    umbralHormigaAplicado: fila.umbralHormigaAplicado?.toNumber() ?? null,
    imagenUrl: fila.imagenUrl,
    fechaCreacion: fila.fechaCreacion,
  });
}

export class PrismaTransaccionRepository implements ITransaccionRepository {
  async buscarPorId(id: string): Promise<Transaccion | null> {
    const fila = await prisma.transaccion.findUnique({ where: { id } });
    return fila ? aDominio(fila) : null;
  }

  async listar(filtros: FiltrosTransacciones): Promise<ResultadoListaTransacciones> {
    const where = {
      usuarioId: filtros.usuarioId,
      ...(filtros.fechaInicio || filtros.fechaFin
        ? {
            fecha: {
              ...(filtros.fechaInicio ? { gte: filtros.fechaInicio } : {}),
              ...(filtros.fechaFin ? { lte: filtros.fechaFin } : {}),
            },
          }
        : {}),
      ...(filtros.tipo ? { tipo: filtros.tipo } : {}),
      ...(filtros.categoriaId ? { categoriaId: filtros.categoriaId } : {}),
    };

    // Sin RF que especifique el orden: supuesto explícito, más reciente
    // primero (fecha desc, fechaCreacion desc como desempate).
    const [filas, total] = await Promise.all([
      prisma.transaccion.findMany({
        where,
        orderBy: [{ fecha: "desc" }, { fechaCreacion: "desc" }],
        skip: (filtros.pagina - 1) * filtros.tamanoPagina,
        take: filtros.tamanoPagina,
      }),
      prisma.transaccion.count({ where }),
    ]);

    return { datos: filas.map(aDominio), total };
  }

  async crear(datos: DatosNuevaTransaccion): Promise<Transaccion> {
    const fila = await prisma.transaccion.create({
      data: {
        usuarioId: datos.usuarioId,
        categoriaId: datos.categoriaId,
        metaAhorroId: datos.metaAhorroId,
        monto: datos.monto,
        tipo: datos.tipo,
        fecha: datos.fecha,
        origen: datos.origen,
        esGastoHormiga: datos.esGastoHormiga,
        umbralHormigaAplicado: datos.umbralHormigaAplicado,
        imagenUrl: datos.imagenUrl,
      },
    });
    return aDominio(fila);
  }

  async actualizar(transaccion: Transaccion): Promise<void> {
    await prisma.transaccion.update({
      where: { id: transaccion.id },
      data: {
        categoriaId: transaccion.categoriaId,
        metaAhorroId: transaccion.metaAhorroId,
        monto: transaccion.monto,
        tipo: transaccion.tipo,
        fecha: transaccion.fecha,
        esGastoHormiga: transaccion.esGastoHormiga,
        esGastoHormigaUsuario: transaccion.esGastoHormigaUsuario,
        umbralHormigaAplicado: transaccion.umbralHormigaAplicado,
      },
    });
  }

  async eliminar(id: string): Promise<void> {
    await prisma.transaccion.delete({ where: { id } });
  }

  async listarPorPeriodo(
    usuarioId: string,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<Transaccion[]> {
    const filas = await prisma.transaccion.findMany({
      where: { usuarioId, fecha: { gte: fechaInicio, lte: fechaFin } },
    });
    return filas.map(aDominio);
  }

  async listarPorMeta(metaAhorroId: string): Promise<Transaccion[]> {
    const filas = await prisma.transaccion.findMany({ where: { metaAhorroId } });
    return filas.map(aDominio);
  }
}

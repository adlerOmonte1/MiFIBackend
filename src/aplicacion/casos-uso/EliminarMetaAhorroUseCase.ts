import type { IMetaAhorroRepository } from "../../dominio/repositorios/IMetaAhorroRepository";
import type { ITransaccionRepository } from "../../dominio/repositorios/ITransaccionRepository";
import { MetaAhorroNoEncontradaError } from "../errores/ErroresAplicacion";
import {
  calcularProgresoMeta,
  type MetaAhorroConProgreso,
} from "./compartido/calcularProgresoMeta";

export interface DatosEliminacionMetaAhorro {
  metaAhorroId: string;
  usuarioId: string;
}

export type ResultadoEliminacionMetaAhorro =
  { tipo: "eliminada" } | { tipo: "marcada-inactiva"; meta: MetaAhorroConProgreso };

/**
 * DELETE /metas-ahorro/{id} — AHO-01. Si la meta tiene transacciones
 * vinculadas, no se puede borrar sin perder ese historial: se marca
 * inactiva en su lugar (regla documentada en el contrato,
 * docs/openapi.yaml). Si no tiene ninguna, se elimina de forma permanente.
 */
export class EliminarMetaAhorroUseCase {
  constructor(
    private readonly metaAhorroRepository: IMetaAhorroRepository,
    private readonly transaccionRepository: ITransaccionRepository,
  ) {}

  async ejecutar(datos: DatosEliminacionMetaAhorro): Promise<ResultadoEliminacionMetaAhorro> {
    const meta = await this.metaAhorroRepository.buscarPorId(datos.metaAhorroId);
    // RF-50, D-05 — mismo error si no existe o si es de otro usuario.
    if (!meta || !meta.perteneceA(datos.usuarioId)) {
      throw new MetaAhorroNoEncontradaError();
    }

    const transaccionesVinculadas = await this.transaccionRepository.listarPorMeta(meta.id);
    if (transaccionesVinculadas.length > 0) {
      const inactiva = await this.metaAhorroRepository.marcarInactiva(meta.id);
      return {
        tipo: "marcada-inactiva",
        meta: await calcularProgresoMeta(inactiva, this.transaccionRepository),
      };
    }

    await this.metaAhorroRepository.eliminar(meta.id);
    return { tipo: "eliminada" };
  }
}

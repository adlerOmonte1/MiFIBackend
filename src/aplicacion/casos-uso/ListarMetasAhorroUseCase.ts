import type { EstadoMetaAhorro } from "../../dominio/entidades/MetaAhorro";
import type { IMetaAhorroRepository } from "../../dominio/repositorios/IMetaAhorroRepository";
import type { ITransaccionRepository } from "../../dominio/repositorios/ITransaccionRepository";
import {
  calcularProgresoMeta,
  type MetaAhorroConProgreso,
} from "./compartido/calcularProgresoMeta";

export interface DatosListadoMetasAhorro {
  usuarioId: string;
  /**
   * "cumplida" nunca es una columna en la base (se calcula en tiempo real,
   * ver MetaAhorro.estadoVisible): el filtro se aplica acá, después de
   * calcular el progreso de cada meta, no en la consulta del repositorio.
   */
  estado?: EstadoMetaAhorro;
}

/** RF-32 a RF-34 — UC-AHO-02. */
export class ListarMetasAhorroUseCase {
  constructor(
    private readonly metaAhorroRepository: IMetaAhorroRepository,
    private readonly transaccionRepository: ITransaccionRepository,
  ) {}

  async ejecutar(datos: DatosListadoMetasAhorro): Promise<MetaAhorroConProgreso[]> {
    const metas = await this.metaAhorroRepository.listar(datos.usuarioId);
    const conProgreso = await Promise.all(
      metas.map((meta) => calcularProgresoMeta(meta, this.transaccionRepository)),
    );

    if (datos.estado === undefined) return conProgreso;
    return conProgreso.filter((m) => m.estado === datos.estado);
  }
}

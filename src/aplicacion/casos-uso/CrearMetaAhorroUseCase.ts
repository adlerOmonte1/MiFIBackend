import type { IMetaAhorroRepository } from "../../dominio/repositorios/IMetaAhorroRepository";
import type { MetaAhorroConProgreso } from "./compartido/calcularProgresoMeta";

export interface DatosNuevaMetaAhorro {
  usuarioId: string;
  nombre: string;
  montoObjetivo: number;
  fechaLimite: Date | null;
}

/** RF-30 a RF-32 — UC-AHO-01. */
export class CrearMetaAhorroUseCase {
  constructor(private readonly metaAhorroRepository: IMetaAhorroRepository) {}

  async ejecutar(datos: DatosNuevaMetaAhorro): Promise<MetaAhorroConProgreso> {
    const meta = await this.metaAhorroRepository.crear(datos);
    // Recién creada: no puede tener transacciones vinculadas todavía
    // (su id no existía antes), así que el progreso es 0 sin necesidad de
    // consultar ITransaccionRepository.
    return {
      meta,
      montoAhorrado: 0,
      porcentajeCumplimiento: meta.calcularProgreso(0),
      estado: meta.estadoVisible(0),
    };
  }
}
